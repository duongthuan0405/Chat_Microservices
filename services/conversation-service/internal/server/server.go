package server

import (
	"context"
	httpdelivery "conversation-service/internal/delivery/http"
	"conversation-service/internal/domain"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type Server struct {
	httpServer *http.Server
}

func New(address string, conversationUsecase domain.ConversationUsecase) *Server {
	r := chi.NewRouter()

	r.Use(httpdelivery.WithRecover)
	r.Use(httpdelivery.WithRequestLog)
	r.Use(httpdelivery.WithCORS)

	r.Get("/health", func(w http.ResponseWriter, req *http.Request) {
		httpdelivery.WriteSuccess(w, http.StatusOK, "conversation-service is running", nil)
	})

	conversationHandler := httpdelivery.NewConversationHandler(conversationUsecase)
	conversationHandler.RegisterRoutes(r)

	internalHandler := httpdelivery.NewInternalHandler(conversationUsecase)
	internalHandler.RegisterRoutes(r)

	return &Server{
		httpServer: &http.Server{
			Addr:              address,
			Handler:           r,
			ReadHeaderTimeout: 5 * time.Second,
			ReadTimeout:       10 * time.Second,
			WriteTimeout:      10 * time.Second,
			IdleTimeout:       60 * time.Second,
		},
	}
}

func (s *Server) Run() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
