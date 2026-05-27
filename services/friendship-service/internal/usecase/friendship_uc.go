package usecase

import (
	"context"
	"errors"
	"friendship-service/internal/domain"
	"strings"
)

type friendshipUsecase struct {
	repo         domain.FriendshipRepository
	userVerifier domain.UserVerifier
}

func NewFriendshipUsecase(repo domain.FriendshipRepository, userVerifier domain.UserVerifier) domain.FriendshipUsecase {
	return &friendshipUsecase{
		repo:         repo,
		userVerifier: userVerifier,
	}
}

func (uc *friendshipUsecase) RequestFriend(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	if err := uc.ensureUsersExist(ctx, userID, friendID); err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status == domain.StatusFriend {
		return errors.New("hai người đã là bạn bè")
	}

	if status == domain.StatusOutgoingPending {
		return errors.New("lời mời kết bạn đã được gửi trước đó")
	}

	if status == domain.StatusIncomingPending {
		return errors.New("người này đã gửi lời mời cho bạn, hãy chấp nhận thay vì gửi lại")
	}

	if status == domain.StatusBlockedByMe {
		return errors.New("bạn đang chặn người này")
	}

	if status == domain.StatusBlockedMe {
		return errors.New("không thể gửi lời mời kết bạn")
	}

	return uc.repo.SendRequest(ctx, userID, friendID)
}

func (uc *friendshipUsecase) AcceptFriend(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	if err := uc.ensureUsersExist(ctx, userID, friendID); err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status != domain.StatusIncomingPending {
		return errors.New("không có lời mời kết bạn hợp lệ để chấp nhận")
	}

	return uc.repo.AcceptRequest(ctx, userID, friendID)
}

func (uc *friendshipUsecase) RejectFriend(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status != domain.StatusIncomingPending {
		return errors.New("không có lời mời kết bạn hợp lệ để từ chối")
	}

	return uc.repo.RejectRequest(ctx, userID, friendID)
}

func (uc *friendshipUsecase) CancelFriendRequest(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status != domain.StatusOutgoingPending {
		return errors.New("không có lời mời kết bạn đã gửi để hủy")
	}

	return uc.repo.CancelRequest(ctx, userID, friendID)
}

func (uc *friendshipUsecase) RemoveFriend(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status != domain.StatusFriend {
		return errors.New("hai người chưa phải bạn bè")
	}

	return uc.repo.RemoveFriend(ctx, userID, friendID)
}

func (uc *friendshipUsecase) BlockUser(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	if err := uc.ensureUsersExist(ctx, userID, friendID); err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status == domain.StatusBlockedByMe {
		return errors.New("bạn đã chặn người này trước đó")
	}

	return uc.repo.BlockUser(ctx, userID, friendID)
}

func (uc *friendshipUsecase) UnblockUser(ctx context.Context, userID, friendID string) error {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if status != domain.StatusBlockedByMe {
		return errors.New("bạn chưa chặn người này")
	}

	return uc.repo.UnblockUser(ctx, userID, friendID)
}

func (uc *friendshipUsecase) ListFriends(ctx context.Context, userID string) ([]string, error) {
	userID, err := validateUserID(userID)
	if err != nil {
		return nil, err
	}

	return uc.repo.GetFriends(ctx, userID)
}

func (uc *friendshipUsecase) ListIncomingRequests(ctx context.Context, userID string) ([]string, error) {
	userID, err := validateUserID(userID)
	if err != nil {
		return nil, err
	}

	return uc.repo.GetIncomingRequests(ctx, userID)
}

func (uc *friendshipUsecase) ListOutgoingRequests(ctx context.Context, userID string) ([]string, error) {
	userID, err := validateUserID(userID)
	if err != nil {
		return nil, err
	}

	return uc.repo.GetOutgoingRequests(ctx, userID)
}

func (uc *friendshipUsecase) GetStatus(ctx context.Context, userID, friendID string) (domain.FriendshipStatusResponse, error) {
	userID, friendID, err := validatePair(userID, friendID)
	if err != nil {
		return domain.FriendshipStatusResponse{}, err
	}

	status, err := uc.repo.GetRelationshipStatus(ctx, userID, friendID)
	if err != nil {
		return domain.FriendshipStatusResponse{}, err
	}

	return domain.FriendshipStatusResponse{
		UserID:   userID,
		FriendID: friendID,
		Status:   status,
	}, nil
}

func (uc *friendshipUsecase) ensureUsersExist(ctx context.Context, userID, friendID string) error {
	userExists, err := uc.userVerifier.Exists(ctx, userID)
	if err != nil {
		return err
	}

	if !userExists {
		return errors.New("người dùng hiện tại không tồn tại")
	}

	friendExists, err := uc.userVerifier.Exists(ctx, friendID)
	if err != nil {
		return err
	}

	if !friendExists {
		return errors.New("người dùng cần thao tác không tồn tại")
	}

	return nil
}

func validateUserID(userID string) (string, error) {
	userID = strings.TrimSpace(userID)

	if userID == "" {
		return "", errors.New("user_id không được trống")
	}

	return userID, nil
}

func validatePair(userID, friendID string) (string, string, error) {
	userID = strings.TrimSpace(userID)
	friendID = strings.TrimSpace(friendID)

	if userID == "" {
		return "", "", errors.New("user_id không được trống")
	}

	if friendID == "" {
		return "", "", errors.New("friend_id không được trống")
	}

	if userID == friendID {
		return "", "", errors.New("bạn không thể thao tác với chính mình")
	}

	return userID, friendID, nil
}
