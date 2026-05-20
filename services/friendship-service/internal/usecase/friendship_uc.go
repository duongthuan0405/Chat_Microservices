package usecase

import (
	"context"
	"errors"
	"friendship-service/internal/domain"
)

type friendshipUsecase struct {
	repo domain.FriendshipRepository
}

// NewFriendshipUsecase dùng để khởi tạo Usecase
func NewFriendshipUsecase(repo domain.FriendshipRepository) domain.FriendshipUsecase {
	return &friendshipUsecase{repo: repo}
}

// 1. Logic Gửi lời mời kết bạn
func (uc *friendshipUsecase) RequestFriend(ctx context.Context, userID, friendID string) error {
	if userID == friendID {
		return errors.New("bạn không thể tự kết bạn với chính mình")
	}
	return uc.repo.SendRequest(ctx, userID, friendID)
}

// 2. Logic Chấp nhận kết bạn (Hàm bị thiếu nãy nè!)
func (uc *friendshipUsecase) ConfirmFriend(ctx context.Context, userID, friendID string) error {
	if userID == "" || friendID == "" {
		return errors.New("đầu vào userID hoặc friendID không được trống")
	}
	return uc.repo.AcceptRequest(ctx, userID, friendID)
}

// 3. Logic Lấy danh sách ID bạn bè
func (uc *friendshipUsecase) ListFriends(ctx context.Context, userID string) ([]string, error) {
	if userID == "" {
		return nil, errors.New("userID không được trống")
	}
	return uc.repo.GetFriends(ctx, userID)
}
