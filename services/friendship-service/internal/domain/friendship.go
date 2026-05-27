package domain

import (
	"context"
	"time"
)

const (
	StatusNone            = "NONE"
	StatusSelf            = "SELF"
	StatusFriend          = "FRIEND"
	StatusOutgoingPending = "OUTGOING_PENDING"
	StatusIncomingPending = "INCOMING_PENDING"
	StatusBlockedByMe     = "BLOCKED_BY_ME"
	StatusBlockedMe       = "BLOCKED_ME"
)

const (
	OutboxStatusPending    = "PENDING"
	OutboxStatusProcessing = "PROCESSING"
	OutboxStatusPublished  = "PUBLISHED"
	OutboxStatusFailed     = "FAILED"
)

type FriendshipActionRequest struct {
	FriendID string `json:"friend_id"`
}

type FriendshipStatusResponse struct {
	UserID   string `json:"user_id"`
	FriendID string `json:"friend_id"`
	Status   string `json:"status"`
}

type UserProfile struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	Name        string `json:"name"`
	PhoneNumber string `json:"phoneNumber"`
	AvatarURL   string `json:"avatarUrl"`
	Gender      string `json:"gender"`
}

type FriendRequestSentIntegrationEvent struct {
	SenderID        string    `json:"senderId"`
	SenderName      string    `json:"senderName"`
	SenderEmail     string    `json:"senderEmail"`
	SenderAvatarURL string    `json:"senderAvatarUrl"`
	ReceiverID      string    `json:"receiverId"`
	Timestamp       time.Time `json:"timestamp"`
}

type FriendRequestAcceptedIntegrationEvent struct {
	SenderID        string    `json:"senderId"`
	SenderName      string    `json:"senderName"`
	SenderEmail     string    `json:"senderEmail"`
	SenderAvatarURL string    `json:"senderAvatarUrl"`
	ReceiverID      string    `json:"receiverId"`
	Timestamp       time.Time `json:"timestamp"`
}

type OutboxEvent struct {
	ID       string
	Exchange string
	Payload  []byte
}

type FriendshipRepository interface {
	EnsureSchema(ctx context.Context) error

	CreateFriendRequestWithOutbox(ctx context.Context, userID, friendID string, event FriendRequestSentIntegrationEvent) error
	AcceptFriendRequestWithOutbox(ctx context.Context, userID, friendID string, event FriendRequestAcceptedIntegrationEvent) error

	RejectRequest(ctx context.Context, userID, friendID string) error
	CancelRequest(ctx context.Context, userID, friendID string) error
	RemoveFriend(ctx context.Context, userID, friendID string) error
	BlockUser(ctx context.Context, userID, friendID string) error
	UnblockUser(ctx context.Context, userID, friendID string) error

	GetFriends(ctx context.Context, userID string) ([]string, error)
	GetIncomingRequests(ctx context.Context, userID string) ([]string, error)
	GetOutgoingRequests(ctx context.Context, userID string) ([]string, error)
	GetRelationshipStatus(ctx context.Context, userID, friendID string) (string, error)

	FetchOutboxEvents(ctx context.Context, limit int) ([]OutboxEvent, error)
	MarkOutboxPublished(ctx context.Context, eventID string) error
	MarkOutboxFailed(ctx context.Context, eventID string, reason string) error
}

type UserProvider interface {
	GetProfile(ctx context.Context, userID string) (UserProfile, error)
}

type EventPublisher interface {
	Publish(ctx context.Context, exchange string, payload []byte) error
	Close() error
}

type FriendshipUsecase interface {
	RequestFriend(ctx context.Context, userID, friendID string) error
	AcceptFriend(ctx context.Context, userID, friendID string) error
	RejectFriend(ctx context.Context, userID, friendID string) error
	CancelFriendRequest(ctx context.Context, userID, friendID string) error
	RemoveFriend(ctx context.Context, userID, friendID string) error
	BlockUser(ctx context.Context, userID, friendID string) error
	UnblockUser(ctx context.Context, userID, friendID string) error
	ListFriends(ctx context.Context, userID string) ([]string, error)
	ListIncomingRequests(ctx context.Context, userID string) ([]string, error)
	ListOutgoingRequests(ctx context.Context, userID string) ([]string, error)
	GetStatus(ctx context.Context, userID, friendID string) (FriendshipStatusResponse, error)
}
