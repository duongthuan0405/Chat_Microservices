package main

import (
	"context"
	"conversation-service/internal/client"
	"conversation-service/internal/config"
	"conversation-service/internal/database"
	"conversation-service/internal/repository"
	"conversation-service/internal/server"
	"conversation-service/internal/usecase"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
)

func main() {
	appCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	db, err := database.NewPostgresPool(appCtx, cfg.PostgresDSN)
	if err != nil {
		log.Fatalf("postgres connection error: %v", err)
	}
	defer db.Close()

	userClient := client.NewUserClient(
		cfg.UserServiceBaseURL,
		cfg.UserServiceRequired,
		cfg.ExternalRequestTimeout,
	)

	conversationRepo := repository.NewPostgresConversationRepository(db)
	conversationUsecase := usecase.NewConversationUsecase(conversationRepo, userClient)

	httpServer := server.New(cfg.Address(), conversationUsecase)

	serverError := make(chan error, 1)

	go func() {
		log.Printf("conversation-service started at %s", cfg.Address())
		serverError <- httpServer.Run()
	}()

	select {
	case err := <-serverError:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	case <-appCtx.Done():
		log.Println("shutdown signal received")

		shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
		defer cancel()

		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			log.Fatalf("graceful shutdown error: %v", err)
		}

		log.Println("conversation-service stopped")
	}
}
