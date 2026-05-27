package domain

import "context"

const (
	StatusNone            = "NONE"
	StatusSelf            = "SELF"
	StatusFriend          = "FRIEND"
	StatusOutgoingPending = "OUTGOING_PENDING"
	StatusIncomingPending = "INCOMING_PENDING"
	StatusBlockedByMe     = "BLOCKED_BY_ME"
	StatusBlockedMe       = "BLOCKED_ME"
)

type FriendshipActionRequest struct {
	FriendID string `json:"friend_id"`
}

type FriendshipStatusResponse struct {
	UserID   string `json:"user_id"`
	FriendID string `json:"friend_id"`
	Status   string `json:"status"`
}

type FriendshipRepository interface {
	EnsureSchema(ctx context.Context) error
	SendRequest(ctx context.Context, userID, friendID string) error
	AcceptRequest(ctx context.Context, userID, friendID string) error
	RejectRequest(ctx context.Context, userID, friendID string) error
	CancelRequest(ctx context.Context, userID, friendID string) error
	RemoveFriend(ctx context.Context, userID, friendID string) error
	BlockUser(ctx context.Context, userID, friendID string) error
	UnblockUser(ctx context.Context, userID, friendID string) error
	GetFriends(ctx context.Context, userID string) ([]string, error)
	GetIncomingRequests(ctx context.Context, userID string) ([]string, error)
	GetOutgoingRequests(ctx context.Context, userID string) ([]string, error)
	GetRelationshipStatus(ctx context.Context, userID, friendID string) (string, error)
}

type UserVerifier interface {
	Exists(ctx context.Context, userID string) (bool, error)
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
