package httpdelivery

import (
	"conversation-service/internal/domain"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ConversationHandler struct {
	usecase domain.ConversationUsecase
}

func NewConversationHandler(usecase domain.ConversationUsecase) *ConversationHandler {
	return &ConversationHandler{
		usecase: usecase,
	}
}

func (h *ConversationHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/conversations", func(r chi.Router) {
		r.Use(WithCurrentUser)

		r.Post("/direct", h.CreateDirectConversation)
		r.Post("/groups", h.CreateGroupConversation)
		r.Get("/", h.ListMyConversations)
		r.Get("/{conversationId}", h.GetConversationDetail)
		r.Get("/{conversationId}/members", h.ListMembers)
		r.Post("/{conversationId}/members", h.AddMember)
		r.Delete("/{conversationId}/members/{memberId}", h.RemoveMember)
		r.Post("/{conversationId}/leave", h.LeaveConversation)
		r.Patch("/{conversationId}/members/{memberId}/role", h.ChangeMemberRole)
	})
}

func (h *ConversationHandler) CreateDirectConversation(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateDirectConversationRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	data, err := h.usecase.CreateDirectConversation(r.Context(), CurrentUserID(r), req.MemberID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusCreated, "đã tạo direct conversation", data)
}

func (h *ConversationHandler) CreateGroupConversation(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateGroupConversationRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	data, err := h.usecase.CreateGroupConversation(r.Context(), CurrentUserID(r), req)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusCreated, "đã tạo group conversation", data)
}

func (h *ConversationHandler) ListMyConversations(w http.ResponseWriter, r *http.Request) {
	data, err := h.usecase.ListMyConversations(r.Context(), CurrentUserID(r))
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", data)
}

func (h *ConversationHandler) GetConversationDetail(w http.ResponseWriter, r *http.Request) {
	data, err := h.usecase.GetConversationDetail(r.Context(), CurrentUserID(r), chi.URLParam(r, "conversationId"))
	if err != nil {
		writeUsecaseError(w, err)
		return
	}

	WriteSuccess(w, http.StatusOK, "", data)
}

func (h *ConversationHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	data, err := h.usecase.ListMembers(r.Context(), CurrentUserID(r), chi.URLParam(r, "conversationId"))
	if err != nil {
		writeUsecaseError(w, err)
		return
	}

	WriteSuccess(w, http.StatusOK, "", data)
}

func (h *ConversationHandler) AddMember(w http.ResponseWriter, r *http.Request) {
	var req domain.AddMemberRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	err := h.usecase.AddMember(r.Context(), CurrentUserID(r), chi.URLParam(r, "conversationId"), req.MemberID)
	if err != nil {
		writeUsecaseError(w, err)
		return
	}

	WriteSuccess(w, http.StatusOK, "đã thêm thành viên", nil)
}

func (h *ConversationHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	err := h.usecase.RemoveMember(r.Context(), CurrentUserID(r), chi.URLParam(r, "conversationId"), chi.URLParam(r, "memberId"))
	if err != nil {
		writeUsecaseError(w, err)
		return
	}

	WriteSuccess(w, http.StatusOK, "đã xóa thành viên", nil)
}

func (h *ConversationHandler) LeaveConversation(w http.ResponseWriter, r *http.Request) {
	err := h.usecase.LeaveConversation(r.Context(), CurrentUserID(r), chi.URLParam(r, "conversationId"))
	if err != nil {
		writeUsecaseError(w, err)
		return
	}

	WriteSuccess(w, http.StatusOK, "đã rời cuộc hội thoại", nil)
}

func (h *ConversationHandler) ChangeMemberRole(w http.ResponseWriter, r *http.Request) {
	var req domain.ChangeRoleRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	err := h.usecase.ChangeMemberRole(r.Context(), CurrentUserID(r), chi.URLParam(r, "conversationId"), chi.URLParam(r, "memberId"), req.Role)
	if err != nil {
		writeUsecaseError(w, err)
		return
	}

	WriteSuccess(w, http.StatusOK, "đã cập nhật role", nil)
}

func writeUsecaseError(w http.ResponseWriter, err error) {
	if err.Error() == "forbidden" {
		WriteError(w, http.StatusForbidden, err.Error())
		return
	}

	WriteError(w, http.StatusBadRequest, err.Error())
}