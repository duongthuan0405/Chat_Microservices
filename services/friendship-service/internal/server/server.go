package server

import (
	"context"
	httpdelivery "friendship-service/internal/delivery/http"
	"friendship-service/internal/domain"
	"net/http"
	"time"
)

type Server struct {
	httpServer *http.Server
}

func New(address string, friendshipUsecase domain.FriendshipUsecase) *Server {
	mux := http.NewServeMux()

	friendshipHandler := httpdelivery.NewFriendshipHandler(friendshipUsecase)
	friendshipHandler.RegisterRoutes(mux)

	handler := httpdelivery.WithRecover(
		httpdelivery.WithRequestLog(
			httpdelivery.WithCORS(mux),
		),
	)

	return &Server{
		httpServer: &http.Server{
			Addr:              address,
			Handler:           handler,
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
