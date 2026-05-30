package repository

import (
	"context"
	"conversation-service/internal/domain"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type postgresConversationRepository struct {
	db *pgxpool.Pool
}

func NewPostgresConversationRepository(db *pgxpool.Pool) domain.ConversationRepository {
	return &postgresConversationRepository{
		db: db,
	}
}

func (r *postgresConversationRepository) CreateDirectConversation(ctx context.Context, creatorID uuid.UUID, memberID uuid.UUID, directKey string) (domain.Conversation, error) {
	now := time.Now().UTC()

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return domain.Conversation{}, err
	}
	defer tx.Rollback(ctx)

	existing, err := getDirectConversationByKeyTx(ctx, tx, directKey)
	if err == nil {
		if err := tx.Commit(ctx); err != nil {
			return domain.Conversation{}, err
		}

		return existing, nil
	}

	if !errors.Is(err, pgx.ErrNoRows) {
		return domain.Conversation{}, err
	}

	conversationID := uuid.New()

	_, err = tx.Exec(ctx, `
		INSERT INTO conversations (
			id,
			type,
			name,
			avatar_url,
			owner_id,
			created_by,
			direct_key,
			status,
			created_at,
			updated_at
		)
		VALUES ($1, $2, NULL, NULL, NULL, $3, $4, $5, $6, $7)
	`, conversationID, domain.ConversationTypeDirect, creatorID, directKey, domain.ConversationStatusActive, now, now)

	if err != nil {
		if isUniqueViolation(err) {
			_ = tx.Rollback(ctx)
			return r.getDirectConversationByKey(ctx, directKey)
		}

		return domain.Conversation{}, err
	}

	if err := insertMember(ctx, tx, conversationID, creatorID, domain.MemberRoleMember, now); err != nil {
		return domain.Conversation{}, err
	}

	if err := insertMember(ctx, tx, conversationID, memberID, domain.MemberRoleMember, now); err != nil {
		return domain.Conversation{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Conversation{}, err
	}

	return r.GetConversationByID(ctx, conversationID)
}

func (r *postgresConversationRepository) CreateGroupConversation(ctx context.Context, creatorID uuid.UUID, name string, avatarURL *string, memberIDs []uuid.UUID) (domain.Conversation, error) {
	now := time.Now().UTC()
	conversationID := uuid.New()

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return domain.Conversation{}, err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO conversations (
			id,
			type,
			name,
			avatar_url,
			owner_id,
			created_by,
			direct_key,
			status,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $8, $9)
	`, conversationID, domain.ConversationTypeGroup, name, avatarURL, creatorID, creatorID, domain.ConversationStatusActive, now, now)

	if err != nil {
		return domain.Conversation{}, err
	}

	if err := insertMember(ctx, tx, conversationID, creatorID, domain.MemberRoleOwner, now); err != nil {
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

		if err := insertMember(ctx, tx, conversationID, memberID, domain.MemberRoleMember, now); err != nil {
			return domain.Conversation{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Conversation{}, err
	}

	return r.GetConversationByID(ctx, conversationID)
}

func (r *postgresConversationRepository) GetConversationByID(ctx context.Context, conversationID uuid.UUID) (domain.Conversation, error) {
	var c domain.Conversation

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			type,
			name,
			avatar_url,
			owner_id,
			created_by,
			status,
			created_at,
			updated_at
		FROM conversations
		WHERE id = $1
		  AND status = $2
	`, conversationID, domain.ConversationStatusActive).Scan(
		&c.ID,
		&c.Type,
		&c.Name,
		&c.AvatarURL,
		&c.OwnerID,
		&c.CreatedBy,
		&c.Status,
		&c.CreatedAt,
		&c.UpdatedAt,
	)

	if err != nil {
		return domain.Conversation{}, err
	}

	return c, nil
}

func (r *postgresConversationRepository) GetConversationWithMembers(ctx context.Context, conversationID uuid.UUID) (domain.ConversationWithMembers, error) {
	conversation, err := r.GetConversationByID(ctx, conversationID)
	if err != nil {
		return domain.ConversationWithMembers{}, err
	}

	members, err := r.getMembers(ctx, conversationID)
	if err != nil {
		return domain.ConversationWithMembers{}, err
	}

	return domain.ConversationWithMembers{
		Conversation: conversation,
		Members:      members,
	}, nil
}

func (r *postgresConversationRepository) ListConversationsByUser(ctx context.Context, userID uuid.UUID) ([]domain.Conversation, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			c.id,
			c.type,
			c.name,
			c.avatar_url,
			c.owner_id,
			c.created_by,
			c.status,
			c.created_at,
			c.updated_at
		FROM conversations c
		INNER JOIN conversation_members m ON m.conversation_id = c.id
		WHERE m.user_id = $1
		  AND m.status = $2
		  AND c.status = $3
		ORDER BY c.updated_at DESC
	`, userID, domain.MemberStatusActive, domain.ConversationStatusActive)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Conversation, 0)

	for rows.Next() {
		var c domain.Conversation

		if err := rows.Scan(
			&c.ID,
			&c.Type,
			&c.Name,
			&c.AvatarURL,
			&c.OwnerID,
			&c.CreatedBy,
			&c.Status,
			&c.CreatedAt,
			&c.UpdatedAt,
		); err != nil {
			return nil, err
		}

		items = append(items, c)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *postgresConversationRepository) SearchConversations(ctx context.Context, userID uuid.UUID, keyword string, conversationType string) ([]domain.Conversation, error) {
	keyword = strings.TrimSpace(keyword)
	conversationType = strings.ToUpper(strings.TrimSpace(conversationType))

	rows, err := r.db.Query(ctx, `
		SELECT
			c.id,
			c.type,
			c.name,
			c.avatar_url,
			c.owner_id,
			c.created_by,
			c.status,
			c.created_at,
			c.updated_at
		FROM conversations c
		INNER JOIN conversation_members m ON m.conversation_id = c.id
		WHERE m.user_id = $1
		  AND m.status = $2
		  AND c.status = $3
		  AND ($4 = '' OR c.type = $4)
		  AND ($5 = '' OR COALESCE(c.name, '') ILIKE '%' || $5 || '%')
		ORDER BY c.updated_at DESC
	`, userID, domain.MemberStatusActive, domain.ConversationStatusActive, conversationType, keyword)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Conversation, 0)

	for rows.Next() {
		var c domain.Conversation

		if err := rows.Scan(
			&c.ID,
			&c.Type,
			&c.Name,
			&c.AvatarURL,
			&c.OwnerID,
			&c.CreatedBy,
			&c.Status,
			&c.CreatedAt,
			&c.UpdatedAt,
		); err != nil {
			return nil, err
		}

		items = append(items, c)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *postgresConversationRepository) IsMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) (bool, error) {
	var exists bool

	err := r.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM conversation_members m
			INNER JOIN conversations c ON c.id = m.conversation_id
			WHERE m.conversation_id = $1
			  AND m.user_id = $2
			  AND m.status = $3
			  AND c.status = $4
		)
	`, conversationID, userID, domain.MemberStatusActive, domain.ConversationStatusActive).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *postgresConversationRepository) GetMemberIDs(ctx context.Context, conversationID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.db.Query(ctx, `
		SELECT user_id
		FROM conversation_members
		WHERE conversation_id = $1
		  AND status = $2
		ORDER BY joined_at ASC
	`, conversationID, domain.MemberStatusActive)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]uuid.UUID, 0)

	for rows.Next() {
		var id uuid.UUID

		if err := rows.Scan(&id); err != nil {
			return nil, err
		}

		ids = append(ids, id)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return ids, nil
}

func (r *postgresConversationRepository) GetMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) (domain.ConversationMember, error) {
	var m domain.ConversationMember

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			conversation_id,
			user_id,
			role,
			status,
			joined_at,
			created_at,
			updated_at
		FROM conversation_members
		WHERE conversation_id = $1
		  AND user_id = $2
		  AND status = $3
	`, conversationID, userID, domain.MemberStatusActive).Scan(
		&m.ID,
		&m.ConversationID,
		&m.UserID,
		&m.Role,
		&m.Status,
		&m.JoinedAt,
		&m.CreatedAt,
		&m.UpdatedAt,
	)

	if err != nil {
		return domain.ConversationMember{}, err
	}

	return m, nil
}

func (r *postgresConversationRepository) AddMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID, role string) error {
	now := time.Now().UTC()

	_, err := r.db.Exec(ctx, `
		INSERT INTO conversation_members (
			id,
			conversation_id,
			user_id,
			role,
			status,
			joined_at,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (conversation_id, user_id)
		DO UPDATE SET
			role = EXCLUDED.role,
			status = EXCLUDED.status,
			joined_at = EXCLUDED.joined_at,
			updated_at = EXCLUDED.updated_at
	`, uuid.New(), conversationID, userID, role, domain.MemberStatusActive, now, now, now)

	if err != nil {
		return err
	}

	return nil
}

func (r *postgresConversationRepository) RemoveMember(ctx context.Context, conversationID uuid.UUID, targetUserID uuid.UUID) error {
	now := time.Now().UTC()

	tag, err := r.db.Exec(ctx, `
		UPDATE conversation_members
		SET status = $1,
		    updated_at = $2
		WHERE conversation_id = $3
		  AND user_id = $4
		  AND status = $5
	`, domain.MemberStatusRemoved, now, conversationID, targetUserID, domain.MemberStatusActive)

	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *postgresConversationRepository) LeaveConversation(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) error {
	now := time.Now().UTC()

	tag, err := r.db.Exec(ctx, `
		UPDATE conversation_members
		SET status = $1,
		    updated_at = $2
		WHERE conversation_id = $3
		  AND user_id = $4
		  AND status = $5
	`, domain.MemberStatusLeft, now, conversationID, userID, domain.MemberStatusActive)

	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *postgresConversationRepository) ChangeMemberRole(ctx context.Context, conversationID uuid.UUID, targetUserID uuid.UUID, role string) error {
	now := time.Now().UTC()

	tag, err := r.db.Exec(ctx, `
		UPDATE conversation_members
		SET role = $1,
		    updated_at = $2
		WHERE conversation_id = $3
		  AND user_id = $4
		  AND status = $5
	`, role, now, conversationID, targetUserID, domain.MemberStatusActive)

	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return errors.New("member not found")
	}

	return nil
}

func (r *postgresConversationRepository) getDirectConversationByKey(ctx context.Context, directKey string) (domain.Conversation, error) {
	var c domain.Conversation

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			type,
			name,
			avatar_url,
			owner_id,
			created_by,
			status,
			created_at,
			updated_at
		FROM conversations
		WHERE direct_key = $1
		  AND status = $2
	`, directKey, domain.ConversationStatusActive).Scan(
		&c.ID,
		&c.Type,
		&c.Name,
		&c.AvatarURL,
		&c.OwnerID,
		&c.CreatedBy,
		&c.Status,
		&c.CreatedAt,
		&c.UpdatedAt,
	)

	if err != nil {
		return domain.Conversation{}, err
	}

	return c, nil
}

func (r *postgresConversationRepository) getMembers(ctx context.Context, conversationID uuid.UUID) ([]domain.ConversationMember, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			conversation_id,
			user_id,
			role,
			status,
			joined_at,
			created_at,
			updated_at
		FROM conversation_members
		WHERE conversation_id = $1
		  AND status = $2
		ORDER BY joined_at ASC
	`, conversationID, domain.MemberStatusActive)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]domain.ConversationMember, 0)

	for rows.Next() {
		var m domain.ConversationMember

		if err := rows.Scan(
			&m.ID,
			&m.ConversationID,
			&m.UserID,
			&m.Role,
			&m.Status,
			&m.JoinedAt,
			&m.CreatedAt,
			&m.UpdatedAt,
		); err != nil {
			return nil, err
		}

		members = append(members, m)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return members, nil
}

func getDirectConversationByKeyTx(ctx context.Context, tx pgx.Tx, directKey string) (domain.Conversation, error) {
	var c domain.Conversation

	err := tx.QueryRow(ctx, `
		SELECT
			id,
			type,
			name,
			avatar_url,
			owner_id,
			created_by,
			status,
			created_at,
			updated_at
		FROM conversations
		WHERE direct_key = $1
		  AND status = $2
	`, directKey, domain.ConversationStatusActive).Scan(
		&c.ID,
		&c.Type,
		&c.Name,
		&c.AvatarURL,
		&c.OwnerID,
		&c.CreatedBy,
		&c.Status,
		&c.CreatedAt,
		&c.UpdatedAt,
	)

	if err != nil {
		return domain.Conversation{}, err
	}

	return c, nil
}

func insertMember(ctx context.Context, tx pgx.Tx, conversationID uuid.UUID, userID uuid.UUID, role string, now time.Time) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO conversation_members (
			id,
			conversation_id,
			user_id,
			role,
			status,
			joined_at,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, uuid.New(), conversationID, userID, role, domain.MemberStatusActive, now, now, now)

	return err
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}

	return false
}
