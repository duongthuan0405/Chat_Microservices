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
	"os"
	"os/signal"
	"syscall"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func main() {
	ctx := context.Background()

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
	defer driver.Close(ctx)

	if err := driver.VerifyConnectivity(ctx); err != nil {
		log.Fatalf("neo4j connectivity error: %v", err)
	}

	friendshipRepo := repository.NewNeo4jRepository(driver)

	if err := friendshipRepo.EnsureSchema(ctx); err != nil {
		log.Fatalf("neo4j schema error: %v", err)
	}

	userClient := client.NewUserClient(
		cfg.UserServiceBaseURL,
		cfg.UserServiceRequired,
		cfg.ExternalRequestTimeout,
	)

	var eventPublisher domain.EventPublisher

	if cfg.RabbitMQURL == "" {
		if cfg.RabbitMQRequired {
			log.Fatal("RABBITMQ_URL is required when RABBITMQ_REQUIRED=true")
		}

		eventPublisher = events.NewNoopPublisher()
		log.Println("RabbitMQ is disabled, using noop publisher")
	} else {
		rabbitPublisher, err := events.NewRabbitMQPublisher(
			cfg.RabbitMQURL,
			cfg.FriendRequestSentExchange,
			cfg.FriendRequestAcceptedExchange,
		)
		if err != nil {
			log.Fatalf("rabbitmq publisher error: %v", err)
		}
		defer rabbitPublisher.Close()

		eventPublisher = rabbitPublisher
	}

	friendshipUsecase := usecase.NewFriendshipUsecase(
		friendshipRepo,
		userClient,
		eventPublisher,
	)

	httpServer := server.New(cfg.Address(), friendshipUsecase)

	serverError := make(chan error, 1)

	go func() {
		log.Printf("friendship-service started at %s", cfg.Address())
		serverError <- httpServer.Run()
	}()

	shutdownSignal := make(chan os.Signal, 1)
	signal.Notify(shutdownSignal, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverError:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	case sig := <-shutdownSignal:
		log.Printf("received signal: %s", sig.String())

		shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
		defer cancel()

		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			log.Fatalf("graceful shutdown error: %v", err)
		}

		log.Println("friendship-service stopped")
	}
}
