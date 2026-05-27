package main

import (
	"context"
	"errors"
	"friendship-service/internal/client"
	"friendship-service/internal/config"
	"friendship-service/internal/domain"
	"friendship-service/internal/events"
	"friendship-service/internal/repository"
	"friendship-service/internal/server"
	"friendship-service/internal/usecase"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func main() {
	appCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	driver, err := neo4j.NewDriverWithContext(
		cfg.Neo4jURI,
		neo4j.BasicAuth(cfg.Neo4jUser, cfg.Neo4jPassword, ""),
	)
	if err != nil {
		log.Fatalf("neo4j driver error: %v", err)
	}
	defer func() {
		closeCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := driver.Close(closeCtx); err != nil {
			log.Printf("neo4j close error: %v", err)
		}
	}()

	if err := driver.VerifyConnectivity(appCtx); err != nil {
		log.Fatalf("neo4j connectivity error: %v", err)
	}

	friendshipRepo := repository.NewNeo4jRepository(driver)

	if err := friendshipRepo.EnsureSchema(appCtx); err != nil {
		log.Fatalf("neo4j schema error: %v", err)
	}

	userClient := client.NewUserClient(
		cfg.UserServiceBaseURL,
		cfg.UserServiceRequired,
		cfg.ExternalRequestTimeout,
	)

	eventPublisher, err := createEventPublisher(cfg)
	if err != nil {
		log.Fatalf("event publisher error: %v", err)
	}
	defer func() {
		if err := eventPublisher.Close(); err != nil {
			log.Printf("event publisher close error: %v", err)
		}
	}()

	outboxWorker := events.NewOutboxWorker(
		friendshipRepo,
		eventPublisher,
		3*time.Second,
		20,
	)

	go outboxWorker.Start(appCtx)

	friendshipUsecase := usecase.NewFriendshipUsecase(
		friendshipRepo,
		userClient,
	)

	httpServer := server.New(cfg.Address(), friendshipUsecase)

	serverError := make(chan error, 1)

	go func() {
		log.Printf("friendship-service started at %s", cfg.Address())
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

		log.Println("friendship-service stopped")
	}
}

func createEventPublisher(cfg config.Config) (domain.EventPublisher, error) {
	if cfg.RabbitMQURL == "" {
		if cfg.RabbitMQRequired {
			return nil, errors.New("RABBITMQ_URL is required when RABBITMQ_REQUIRED=true")
		}

		log.Println("RabbitMQ is disabled, using noop publisher")
		return events.NewNoopPublisher(), nil
	}

	return events.NewRabbitMQPublisher(
		cfg.RabbitMQURL,
		[]string{
			cfg.FriendRequestSentExchange,
			cfg.FriendRequestAcceptedExchange,
		},
	)
}
