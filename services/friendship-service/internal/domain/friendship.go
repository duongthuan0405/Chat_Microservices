package domain

import "context"

const (
	StatusPending  = "PENDING"
	StatusAccepted = "ACCEPTED"
	StatusBlocked  = "BLOCKED"
)

type Friendship struct {
	UserID   string `json:"user_id"`
	FriendID string `json:"friend_id"`
	Status   string `json:"status"`
}

type FriendshipRepository interface {
	SendRequest(ctx context.Context, userID, friendID string) error
	AcceptRequest(ctx context.Context, userID, friendID string) error
	GetFriends(ctx context.Context, userID string) ([]string, error)
}

type FriendshipUsecase interface {
	RequestFriend(ctx context.Context, userID, friendID string) error
	ConfirmFriend(ctx context.Context, userID, friendID string) error
	ListFriends(ctx context.Context, userID string) ([]string, error)
}
