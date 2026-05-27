package repository

import (
	"context"
	dbsqlc "conversation-service/internal/db/sqlc"
	"conversation-service/internal/domain"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type postgresConversationRepository struct {
	db      *pgxpool.Pool
	queries *dbsqlc.Queries
}

func NewPostgresConversationRepository(db *pgxpool.Pool) domain.ConversationRepository {
	return &postgresConversationRepository{
		db:      db,
		queries: dbsqlc.New(db),
	}
}

func (r *postgresConversationRepository) CreateDirectConversation(ctx context.Context, creatorID uuid.UUID, memberID uuid.UUID, directKey string) (domain.Conversation, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return domain.Conversation{}, err
	}
	defer tx.Rollback(ctx)

	qtx := r.queries.WithTx(tx)

	existing, err := qtx.GetDirectConversationByKey(ctx, &directKey)
	if err == nil {
		if err := tx.Commit(ctx); err != nil {
			return domain.Conversation{}, err
		}

		return mapConversation(existing), nil
	}

	if !errors.Is(err, pgx.ErrNoRows) {
		return domain.Conversation{}, err
	}

	created, err := qtx.CreateConversation(ctx, dbsqlc.CreateConversationParams{
		ID:        uuid.New(),
		Type:      domain.ConversationTypeDirect,
		Name:      nil,
		AvatarUrl: nil,
		OwnerID:   nil,
		CreatedBy: creatorID,
		DirectKey: &directKey,
		Status:    domain.ConversationStatusActive,
	})
	if err != nil {
		if isUniqueViolation(err) {
			found, findErr := r.queries.GetDirectConversationByKey(ctx, &directKey)
			if findErr != nil {
				return domain.Conversation{}, findErr
			}

			return mapConversation(found), nil
		}

		return domain.Conversation{}, err
	}

	if err := qtx.InsertMember(ctx, dbsqlc.InsertMemberParams{
		ID:             uuid.New(),
		ConversationID: created.ID,
		UserID:         creatorID,
		Role:           domain.MemberRoleMember,
	}); err != nil {
		return domain.Conversation{}, err
	}

	if err := qtx.InsertMember(ctx, dbsqlc.InsertMemberParams{
		ID:             uuid.New(),
		ConversationID: created.ID,
		UserID:         memberID,
		Role:           domain.MemberRoleMember,
	}); err != nil {
		return domain.Conversation{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Conversation{}, err
	}

	return mapConversation(created), nil
}

func (r *postgresConversationRepository) CreateGroupConversation(ctx context.Context, creatorID uuid.UUID, name string, avatarURL *string, memberIDs []uuid.UUID) (domain.Conversation, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return domain.Conversation{}, err
	}
	defer tx.Rollback(ctx)

	qtx := r.queries.WithTx(tx)

	created, err := qtx.CreateConversation(ctx, dbsqlc.CreateConversationParams{
		ID:        uuid.New(),
		Type:      domain.ConversationTypeGroup,
		Name:      &name,
		AvatarUrl: avatarURL,
		OwnerID:   &creatorID,
		CreatedBy: creatorID,
		DirectKey: nil,
		Status:    domain.ConversationStatusActive,
	})
	if err != nil {
		return domain.Conversation{}, err
	}

	if err := qtx.InsertMember(ctx, dbsqlc.InsertMemberParams{
		ID:             uuid.New(),
		ConversationID: created.ID,
		UserID:         creatorID,
		Role:           domain.MemberRoleOwner,
	}); err != nil {
		return domain.Conversation{}, err
	}

	seen := map[uuid.UUID]bool{
		creatorID: true,
	}

	for _, memberID := range memberIDs {
		if seen[memberID] {
			continue
		}

		seen[memberID] = true

		if err := qtx.InsertMember(ctx, dbsqlc.InsertMemberParams{
			ID:             uuid.New(),
			ConversationID: created.ID,
			UserID:         memberID,
			Role:           domain.MemberRoleMember,
		}); err != nil {
			return domain.Conversation{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Conversation{}, err
	}

	return mapConversation(created), nil
}

func (r *postgresConversationRepository) GetConversationByID(ctx context.Context, conversationID uuid.UUID) (domain.Conversation, error) {
	row, err := r.queries.GetConversationByID(ctx, conversationID)
	if err != nil {
		return domain.Conversation{}, err
	}

	return mapConversation(row), nil
}

func (r *postgresConversationRepository) GetConversationWithMembers(ctx context.Context, conversationID uuid.UUID) (domain.ConversationWithMembers, error) {
	conversation, err := r.GetConversationByID(ctx, conversationID)
	if err != nil {
		return domain.ConversationWithMembers{}, err
	}

	rows, err := r.queries.ListMembers(ctx, conversationID)
	if err != nil {
		return domain.ConversationWithMembers{}, err
	}

	members := make([]domain.ConversationMember, 0, len(rows))

	for _, row := range rows {
		members = append(members, mapMember(row))
	}

	return domain.ConversationWithMembers{
		Conversation: conversation,
		Members:      members,
	}, nil
}

func (r *postgresConversationRepository) ListConversationsByUser(ctx context.Context, userID uuid.UUID) ([]domain.Conversation, error) {
	rows, err := r.queries.ListConversationsByUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	items := make([]domain.Conversation, 0, len(rows))

	for _, row := range rows {
		items = append(items, mapConversation(row))
	}

	return items, nil
}

func (r *postgresConversationRepository) IsMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) (bool, error) {
	return r.queries.IsMember(ctx, dbsqlc.IsMemberParams{
		ConversationID: conversationID,
		UserID:         userID,
	})
}

func (r *postgresConversationRepository) GetMemberIDs(ctx context.Context, conversationID uuid.UUID) ([]uuid.UUID, error) {
	return r.queries.GetMemberIDs(ctx, conversationID)
}

func (r *postgresConversationRepository) GetMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) (domain.ConversationMember, error) {
	row, err := r.queries.GetMember(ctx, dbsqlc.GetMemberParams{
		ConversationID: conversationID,
		UserID:         userID,
	})
	if err != nil {
		return domain.ConversationMember{}, err
	}

	return mapMember(row), nil
}

func (r *postgresConversationRepository) AddMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID, role string) error {
	return r.queries.UpsertActiveMember(ctx, dbsqlc.UpsertActiveMemberParams{
		ID:             uuid.New(),
		ConversationID: conversationID,
		UserID:         userID,
		Role:           role,
	})
}

func (r *postgresConversationRepository) RemoveMember(ctx context.Context, conversationID uuid.UUID, targetUserID uuid.UUID) error {
	rowsAffected, err := r.queries.RemoveMember(ctx, dbsqlc.RemoveMemberParams{
		ConversationID: conversationID,
		UserID:         targetUserID,
	})
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *postgresConversationRepository) LeaveConversation(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) error {
	rowsAffected, err := r.queries.LeaveConversation(ctx, dbsqlc.LeaveConversationParams{
		ConversationID: conversationID,
		UserID:         userID,
	})
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *postgresConversationRepository) ChangeMemberRole(ctx context.Context, conversationID uuid.UUID, targetUserID uuid.UUID, role string) error {
	rowsAffected, err := r.queries.ChangeMemberRole(ctx, dbsqlc.ChangeMemberRoleParams{
		ConversationID: conversationID,
		UserID:         targetUserID,
		Role:           role,
	})
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("member not found")
	}

	return nil
}

func mapConversation(row dbsqlc.Conversation) domain.Conversation {
	return domain.Conversation{
		ID:        row.ID,
		Type:      row.Type,
		Name:      row.Name,
		AvatarURL: row.AvatarUrl,
		OwnerID:   row.OwnerID,
		CreatedBy: row.CreatedBy,
		Status:    row.Status,
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
	}
}

func mapMember(row dbsqlc.ConversationMember) domain.ConversationMember {
	return domain.ConversationMember{
		ID:             row.ID,
		ConversationID: row.ConversationID,
		UserID:         row.UserID,
		Role:           row.Role,
		Status:         row.Status,
		JoinedAt:       row.JoinedAt,
		CreatedAt:      row.CreatedAt,
		UpdatedAt:      row.UpdatedAt,
	}
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}

	return false
}
