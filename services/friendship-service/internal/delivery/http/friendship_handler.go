package httpdelivery

import (
	"encoding/json"
	"errors"
	"friendship-service/internal/domain"
	"net/http"
	"strings"
)

type FriendshipHandler struct {
	usecase domain.FriendshipUsecase
}

func NewFriendshipHandler(usecase domain.FriendshipUsecase) *FriendshipHandler {
	return &FriendshipHandler{
		usecase: usecase,
	}
}

func (h *FriendshipHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/health", h.Health)

	mux.Handle("/friendships", WithCurrentUser(http.HandlerFunc(h.Friendships)))
	mux.Handle("/friendships/request", WithCurrentUser(http.HandlerFunc(h.RequestFriend)))
	mux.Handle("/friendships/accept", WithCurrentUser(http.HandlerFunc(h.AcceptFriend)))
	mux.Handle("/friendships/reject", WithCurrentUser(http.HandlerFunc(h.RejectFriend)))
	mux.Handle("/friendships/cancel", WithCurrentUser(http.HandlerFunc(h.CancelFriendRequest)))
	mux.Handle("/friendships/block", WithCurrentUser(http.HandlerFunc(h.BlockUser)))
	mux.Handle("/friendships/unblock", WithCurrentUser(http.HandlerFunc(h.UnblockUser)))
	mux.Handle("/friendships/status", WithCurrentUser(http.HandlerFunc(h.GetStatus)))
	mux.Handle("/friendships/requests/incoming", WithCurrentUser(http.HandlerFunc(h.ListIncomingRequests)))
	mux.Handle("/friendships/requests/outgoing", WithCurrentUser(http.HandlerFunc(h.ListOutgoingRequests)))
}

func (h *FriendshipHandler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	WriteSuccess(w, http.StatusOK, "friendship-service is running", nil)
}

func (h *FriendshipHandler) Friendships(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.ListFriends(w, r)
	case http.MethodDelete:
		h.RemoveFriend(w, r)
	default:
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (h *FriendshipHandler) RequestFriend(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.RequestFriend(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusCreated, "đã gửi lời mời kết bạn", nil)
}

func (h *FriendshipHandler) AcceptFriend(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.AcceptFriend(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "đã chấp nhận lời mời kết bạn", nil)
}

func (h *FriendshipHandler) RejectFriend(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.RejectFriend(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "đã từ chối lời mời kết bạn", nil)
}

func (h *FriendshipHandler) CancelFriendRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.CancelFriendRequest(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "đã hủy lời mời kết bạn", nil)
}

func (h *FriendshipHandler) RemoveFriend(w http.ResponseWriter, r *http.Request) {
	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.RemoveFriend(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "đã xóa bạn bè", nil)
}

func (h *FriendshipHandler) BlockUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.BlockUser(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "đã chặn người dùng", nil)
}

func (h *FriendshipHandler) UnblockUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	req, err := readFriendshipActionRequest(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.usecase.UnblockUser(r.Context(), userID, req.FriendID); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "đã bỏ chặn người dùng", nil)
}

func (h *FriendshipHandler) ListFriends(w http.ResponseWriter, r *http.Request) {
	userID := CurrentUserID(r)

	friends, err := h.usecase.ListFriends(r.Context(), userID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", friends)
}

func (h *FriendshipHandler) ListIncomingRequests(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	requests, err := h.usecase.ListIncomingRequests(r.Context(), userID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", requests)
}

func (h *FriendshipHandler) ListOutgoingRequests(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)

	requests, err := h.usecase.ListOutgoingRequests(r.Context(), userID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", requests)
}

func (h *FriendshipHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID := CurrentUserID(r)
	friendID := strings.TrimSpace(r.URL.Query().Get("friend_id"))

	if friendID == "" {
		WriteError(w, http.StatusBadRequest, "friend_id không được trống")
		return
	}

	status, err := h.usecase.GetStatus(r.Context(), userID, friendID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", status)
}

func readFriendshipActionRequest(r *http.Request) (domain.FriendshipActionRequest, error) {
	var req domain.FriendshipActionRequest
	var errFriendIDRequired = errors.New("friend_id không được trống")
	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "application/json") {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			return req, err
		}
	} else {
		req.FriendID = r.URL.Query().Get("friend_id")
	}

	req.FriendID = strings.TrimSpace(req.FriendID)

	if req.FriendID == "" {
		return req, errFriendIDRequired
	}

	return req, nil
}
