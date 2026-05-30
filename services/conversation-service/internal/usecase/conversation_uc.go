package usecase

import (
	"context"
	"conversation-service/internal/domain"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type conversationUsecase struct {
	repo                     domain.ConversationRepository
	userProvider             domain.UserProvider
	eventPublisher           domain.EventPublisher
	addedToGroupChatExchange string
}

func NewConversationUsecase(
	repo domain.ConversationRepository,
	userProvider domain.UserProvider,
	eventPublisher domain.EventPublisher,
	addedToGroupChatExchange string,
) domain.ConversationUsecase {
	return &conversationUsecase{
		repo:                     repo,
		userProvider:             userProvider,
		eventPublisher:           eventPublisher,
		addedToGroupChatExchange: addedToGroupChatExchange,
	}
}

func (uc *conversationUsecase) CreateDirectConversation(ctx context.Context, currentUserID string, memberID string) (domain.Conversation, error) {
	currentID, err := parseUUID(currentUserID, "current user id")
	if err != nil {
		return domain.Conversation{}, err
	}

	targetID, err := parseUUID(memberID, "member id")
	if err != nil {
		return domain.Conversation{}, err
	}

	if currentID == targetID {
		return domain.Conversation{}, errors.New("không thể tạo direct conversation với chính mình")
	}

	if _, err := uc.userProvider.GetProfile(ctx, currentID.String()); err != nil {
		return domain.Conversation{}, err
	}

	if _, err := uc.userProvider.GetProfile(ctx, targetID.String()); err != nil {
		return domain.Conversation{}, err
	}

	directKey := domain.MakeDirectKey(currentID, targetID)

	return uc.repo.CreateDirectConversation(ctx, currentID, targetID, directKey)
}

func (uc *conversationUsecase) CreateGroupConversation(ctx context.Context, currentUserID string, req domain.CreateGroupConversationRequest) (domain.Conversation, error) {
	currentID, err := parseUUID(currentUserID, "current user id")
	if err != nil {
		return domain.Conversation{}, err
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return domain.Conversation{}, errors.New("group name không được trống")
	}

	creatorProfile, err := uc.userProvider.GetProfile(ctx, currentID.String())
	if err != nil {
		return domain.Conversation{}, err
	}

	memberIDs := make([]uuid.UUID, 0)

	for _, rawID := range req.MemberIDs {
		memberID, err := parseUUID(rawID, "member id")
		if err != nil {
			return domain.Conversation{}, err
		}

		if memberID == currentID {
			continue
		}

		if _, err := uc.userProvider.GetProfile(ctx, memberID.String()); err != nil {
			return domain.Conversation{}, err
		}

		memberIDs = append(memberIDs, memberID)
	}

	var avatarURL *string
	trimmedAvatarURL := strings.TrimSpace(req.AvatarURL)
	if trimmedAvatarURL != "" {
		avatarURL = &trimmedAvatarURL
	}

	conversation, err := uc.repo.CreateGroupConversation(ctx, currentID, name, avatarURL, memberIDs)
	if err != nil {
		return domain.Conversation{}, err
	}

	for _, memberID := range memberIDs {
		if err := uc.publishAddedToGroupChatEvent(ctx, conversation.ID.String(), name, creatorProfile.ID, creatorProfile.Name, memberID.String()); err != nil {
			return domain.Conversation{}, err
		}
	}

	return conversation, nil
}

func (uc *conversationUsecase) GetConversationDetail(ctx context.Context, currentUserID string, conversationID string) (domain.ConversationWithMembers, error) {
	currentID, convID, err := parseCurrentAndConversation(currentUserID, conversationID)
	if err != nil {
		return domain.ConversationWithMembers{}, err
	}

	isMember, err := uc.repo.IsMember(ctx, convID, currentID)
	if err != nil {
		return domain.ConversationWithMembers{}, err
	}

	if !isMember {
		return domain.ConversationWithMembers{}, errors.New("forbidden")
	}

	return uc.repo.GetConversationWithMembers(ctx, convID)
}

func (uc *conversationUsecase) ListMyConversations(ctx context.Context, currentUserID string) ([]domain.Conversation, error) {
	currentID, err := parseUUID(currentUserID, "current user id")
	if err != nil {
		return nil, err
	}

	return uc.repo.ListConversationsByUser(ctx, currentID)
}

func (uc *conversationUsecase) ListMembers(ctx context.Context, currentUserID string, conversationID string) ([]domain.ConversationMember, error) {
	currentID, convID, err := parseCurrentAndConversation(currentUserID, conversationID)
	if err != nil {
		return nil, err
	}

	isMember, err := uc.repo.IsMember(ctx, convID, currentID)
	if err != nil {
		return nil, err
	}

	if !isMember {
		return nil, errors.New("forbidden")
	}

	data, err := uc.repo.GetConversationWithMembers(ctx, convID)
	if err != nil {
		return nil, err
	}

	return data.Members, nil
}

func (uc *conversationUsecase) AddMember(ctx context.Context, currentUserID string, conversationID string, memberID string) error {
	currentID, convID, err := parseCurrentAndConversation(currentUserID, conversationID)
	if err != nil {
		return err
	}

	targetID, err := parseUUID(memberID, "member id")
	if err != nil {
		return err
	}

	conversation, err := uc.repo.GetConversationByID(ctx, convID)
	if err != nil {
		return err
	}

	if conversation.Type != domain.ConversationTypeGroup {
		return errors.New("chỉ group conversation mới được thêm thành viên")
	}

	currentMember, err := uc.repo.GetMember(ctx, convID, currentID)
	if err != nil {
		return err
	}

	if !canManageMembers(currentMember.Role) {
		return errors.New("forbidden")
	}

	adderProfile, err := uc.userProvider.GetProfile(ctx, currentID.String())
	if err != nil {
		return err
	}

	if _, err := uc.userProvider.GetProfile(ctx, targetID.String()); err != nil {
		return err
	}

	if err := uc.repo.AddMember(ctx, convID, targetID, domain.MemberRoleMember); err != nil {
		return err
	}

	groupName := ""
	if conversation.Name != nil {
		groupName = strings.TrimSpace(*conversation.Name)
	}

	return uc.publishAddedToGroupChatEvent(
		ctx,
		conversation.ID.String(),
		groupName,
		adderProfile.ID,
		adderProfile.Name,
		targetID.String(),
	)
}

func (uc *conversationUsecase) RemoveMember(ctx context.Context, currentUserID string, conversationID string, targetUserID string) error {
	currentID, convID, err := parseCurrentAndConversation(currentUserID, conversationID)
	if err != nil {
		return err
	}

	targetID, err := parseUUID(targetUserID, "target user id")
	if err != nil {
		return err
	}

	currentMember, err := uc.repo.GetMember(ctx, convID, currentID)
	if err != nil {
		return err
	}

	targetMember, err := uc.repo.GetMember(ctx, convID, targetID)
	if err != nil {
		return err
	}

	if targetMember.Role == domain.MemberRoleOwner {
		return errors.New("không thể remove owner")
	}

	if currentMember.Role == domain.MemberRoleAdmin && targetMember.Role == domain.MemberRoleAdmin {
		return errors.New("admin không thể remove admin khác")
	}

	if !canManageMembers(currentMember.Role) {
		return errors.New("forbidden")
	}

	return uc.repo.RemoveMember(ctx, convID, targetID)
}

func (uc *conversationUsecase) LeaveConversation(ctx context.Context, currentUserID string, conversationID string) error {
	currentID, convID, err := parseCurrentAndConversation(currentUserID, conversationID)
	if err != nil {
		return err
	}

	member, err := uc.repo.GetMember(ctx, convID, currentID)
	if err != nil {
		return err
	}

	if member.Role == domain.MemberRoleOwner {
		return errors.New("owner không thể rời nhóm trước khi chuyển quyền")
	}

	return uc.repo.LeaveConversation(ctx, convID, currentID)
}

func (uc *conversationUsecase) ChangeMemberRole(ctx context.Context, currentUserID string, conversationID string, targetUserID string, role string) error {
	currentID, convID, err := parseCurrentAndConversation(currentUserID, conversationID)
	if err != nil {
		return err
	}

	targetID, err := parseUUID(targetUserID, "target user id")
	if err != nil {
		return err
	}

	role = strings.TrimSpace(role)
	if role != domain.MemberRoleAdmin && role != domain.MemberRoleMember {
		return errors.New("role không hợp lệ")
	}

	currentMember, err := uc.repo.GetMember(ctx, convID, currentID)
	if err != nil {
		return err
	}

	if currentMember.Role != domain.MemberRoleOwner {
		return errors.New("chỉ owner được đổi role")
	}

	targetMember, err := uc.repo.GetMember(ctx, convID, targetID)
	if err != nil {
		return err
	}

	if targetMember.Role == domain.MemberRoleOwner {
		return errors.New("không thể đổi role owner")
	}

	return uc.repo.ChangeMemberRole(ctx, convID, targetID, role)
}

func (uc *conversationUsecase) IsMember(ctx context.Context, conversationID string, userID string) (bool, error) {
	userUUID, convUUID, err := parseCurrentAndConversation(userID, conversationID)
	if err != nil {
		return false, err
	}

	return uc.repo.IsMember(ctx, convUUID, userUUID)
}

func (uc *conversationUsecase) GetMemberIDs(ctx context.Context, conversationID string) ([]string, error) {
	convID, err := parseUUID(conversationID, "conversation id")
	if err != nil {
		return nil, err
	}

	ids, err := uc.repo.GetMemberIDs(ctx, convID)
	if err != nil {
		return nil, err
	}

	result := make([]string, 0, len(ids))

	for _, id := range ids {
		result = append(result, id.String())
	}

	return result, nil
}

func parseCurrentAndConversation(currentUserID string, conversationID string) (uuid.UUID, uuid.UUID, error) {
	currentID, err := parseUUID(currentUserID, "current user id")
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}

	convID, err := parseUUID(conversationID, "conversation id")
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}

	return currentID, convID, nil
}

func parseUUID(value string, fieldName string) (uuid.UUID, error) {
	value = strings.TrimSpace(value)

	if value == "" {
		return uuid.Nil, errors.New(fieldName + " không được trống")
	}

	id, err := uuid.Parse(value)
	if err != nil {
		return uuid.Nil, errors.New(fieldName + " không hợp lệ")
	}

	return id, nil
}

func canManageMembers(role string) bool {
	return role == domain.MemberRoleOwner || role == domain.MemberRoleAdmin
}

func (uc *conversationUsecase) publishAddedToGroupChatEvent(
	ctx context.Context,
	groupID string,
	groupName string,
	adderID string,
	adderName string,
	addedUserID string,
) error {
	if uc.eventPublisher == nil {
		return nil
	}

	event := domain.AddedToGroupChatIntegrationEvent{
		GroupID:     groupID,
		GroupName:   groupName,
		AdderID:     adderID,
		AdderName:   adderName,
		AddedUserID: addedUserID,
		Timestamp:   time.Now().UTC(),
	}

	payload, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return uc.eventPublisher.Publish(ctx, uc.addedToGroupChatExchange, payload)
}

func (uc *conversationUsecase) SearchConversations(ctx context.Context, currentUserID string, keyword string, conversationType string) ([]domain.Conversation, error) {
	currentID, err := parseUUID(currentUserID, "current user id")
	if err != nil {
		return nil, err
	}

	keyword = strings.TrimSpace(keyword)
	conversationType = strings.ToUpper(strings.TrimSpace(conversationType))

	if conversationType != "" &&
		conversationType != domain.ConversationTypeDirect &&
		conversationType != domain.ConversationTypeGroup {
		return nil, errors.New("conversation type không hợp lệ")
	}

	return uc.repo.SearchConversations(ctx, currentID, keyword, conversationType)
}
