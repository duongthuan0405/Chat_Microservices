package domain

import (
	"context"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	ConversationTypeDirect = "DIRECT"
	ConversationTypeGroup  = "GROUP"

	ConversationStatusActive   = "ACTIVE"
	ConversationStatusArchived = "ARCHIVED"
	ConversationStatusDeleted  = "DELETED"

	MemberRoleOwner  = "OWNER"
	MemberRoleAdmin  = "ADMIN"
	MemberRoleMember = "MEMBER"

	MemberStatusActive  = "ACTIVE"
	MemberStatusLeft    = "LEFT"
	MemberStatusRemoved = "REMOVED"
	MemberStatusBanned  = "BANNED"
)

type UserProfile struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	Name        string `json:"name"`
	PhoneNumber string `json:"phoneNumber"`
	AvatarURL   string `json:"avatarUrl"`
	Gender      string `json:"gender"`
}

type Conversation struct {
	ID        uuid.UUID  `json:"id"`
	Type      string     `json:"type"`
	Name      *string    `json:"name,omitempty"`
	AvatarURL *string    `json:"avatarUrl,omitempty"`
	OwnerID   *uuid.UUID `json:"ownerId,omitempty"`
	CreatedBy uuid.UUID  `json:"createdBy"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}


type ConversationMember struct {
	ID             uuid.UUID  `json:"id"`
	ConversationID uuid.UUID  `json:"conversationId"`
	UserID         uuid.UUID  `json:"userId"`
	Role           string     `json:"role"`
	Status         string     `json:"status"`
	JoinedAt       *time.Time `json:"joinedAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type ConversationWithMembers struct {
	Conversation Conversation         `json:"conversation"`
	Members      []ConversationMember `json:"members"`
}

type CreateDirectConversationRequest struct {
	MemberID string `json:"member_id"`
}

type CreateGroupConversationRequest struct {
	Name      string   `json:"name"`
	AvatarURL string   `json:"avatarUrl"`
	MemberIDs []string `json:"member_ids"`
}

type AddMemberRequest struct {
	MemberID string `json:"member_id"`
}

type ChangeRoleRequest struct {
	Role string `json:"role"`
}

type IsMemberResponse struct {
	IsMember bool `json:"isMember"`
}

type MemberIdsResponse struct {
	MemberIDs []string `json:"memberIds"`
}

type UserProvider interface {
	GetProfile(ctx context.Context, userID string) (UserProfile, error)
}

type AddedToGroupChatIntegrationEvent struct {
	GroupID     string    `json:"groupId"`
	GroupName   string    `json:"groupName"`
	AdderID     string    `json:"adderId"`
	AdderName   string    `json:"adderName"`
	AddedUserID string    `json:"addedUserId"`
	Timestamp   time.Time `json:"timestamp"`
}

type EventPublisher interface {
	Publish(ctx context.Context, exchange string, payload []byte) error
	Close() error
}

type ConversationRepository interface {
	CreateDirectConversation(ctx context.Context, creatorID uuid.UUID, memberID uuid.UUID, directKey string) (Conversation, error)
	CreateGroupConversation(ctx context.Context, creatorID uuid.UUID, name string, avatarURL *string, memberIDs []uuid.UUID) (Conversation, error)

	GetConversationByID(ctx context.Context, conversationID uuid.UUID) (Conversation, error)
	GetConversationWithMembers(ctx context.Context, conversationID uuid.UUID) (ConversationWithMembers, error)
	ListConversationsByUser(ctx context.Context, userID uuid.UUID) ([]Conversation, error)

	IsMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) (bool, error)
	GetMemberIDs(ctx context.Context, conversationID uuid.UUID) ([]uuid.UUID, error)
	GetMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) (ConversationMember, error)

	AddMember(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID, role string) error
	RemoveMember(ctx context.Context, conversationID uuid.UUID, targetUserID uuid.UUID) error
	LeaveConversation(ctx context.Context, conversationID uuid.UUID, userID uuid.UUID) error
	ChangeMemberRole(ctx context.Context, conversationID uuid.UUID, targetUserID uuid.UUID, role string) error
}

type ConversationUsecase interface {
	CreateDirectConversation(ctx context.Context, currentUserID string, memberID string) (Conversation, error)
	CreateGroupConversation(ctx context.Context, currentUserID string, req CreateGroupConversationRequest) (Conversation, error)

	GetConversationDetail(ctx context.Context, currentUserID string, conversationID string) (ConversationWithMembers, error)
	ListMyConversations(ctx context.Context, currentUserID string) ([]Conversation, error)
	ListMembers(ctx context.Context, currentUserID string, conversationID string) ([]ConversationMember, error)

	AddMember(ctx context.Context, currentUserID string, conversationID string, memberID string) error
	RemoveMember(ctx context.Context, currentUserID string, conversationID string, targetUserID string) error
	LeaveConversation(ctx context.Context, currentUserID string, conversationID string) error
	ChangeMemberRole(ctx context.Context, currentUserID string, conversationID string, targetUserID string, role string) error

	IsMember(ctx context.Context, conversationID string, userID string) (bool, error)
	GetMemberIDs(ctx context.Context, conversationID string) ([]string, error)
}

func MakeDirectKey(a uuid.UUID, b uuid.UUID) string {
	ids := []string{a.String(), b.String()}
	sort.Strings(ids)
	return strings.Join(ids, ":")
}
