package httpdelivery

import (
	"conversation-service/internal/domain"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type InternalHandler struct {
	usecase domain.ConversationUsecase
}

func NewInternalHandler(usecase domain.ConversationUsecase) *InternalHandler {
	return &InternalHandler{
		usecase: usecase,
	}
}

func (h *InternalHandler) RegisterRoutes(r chi.Router) {
	r.Route("/internal/conversations", func(r chi.Router) {
		r.Get("/{conversationId}/members/{userId}/exists", h.IsMember)
		r.Get("/{conversationId}/members", h.GetMemberIDs)
	})
}

func (h *InternalHandler) IsMember(w http.ResponseWriter, r *http.Request) {
	isMember, err := h.usecase.IsMember(r.Context(), chi.URLParam(r, "conversationId"), chi.URLParam(r, "userId"))
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", domain.IsMemberResponse{
		IsMember: isMember,
	})
}

func (h *InternalHandler) GetMemberIDs(w http.ResponseWriter, r *http.Request) {
	memberIDs, err := h.usecase.GetMemberIDs(r.Context(), chi.URLParam(r, "conversationId"))
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	WriteSuccess(w, http.StatusOK, "", domain.MemberIdsResponse{
		MemberIDs: memberIDs,
	})
}
