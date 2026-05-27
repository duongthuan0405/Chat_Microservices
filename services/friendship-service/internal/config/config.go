package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort                    string
	Neo4jURI                      string
	Neo4jUser                     string
	Neo4jPassword                 string
	UserServiceBaseURL            string
	UserServiceRequired           bool
	ShutdownTimeout               time.Duration
	ExternalRequestTimeout        time.Duration
	RabbitMQURL                   string
	RabbitMQRequired              bool
	FriendRequestSentExchange     string
	FriendRequestAcceptedExchange string
}

func Load() (Config, error) {
	_ = godotenv.Load("friend-ship.env")
	_ = godotenv.Load(".env")

	cfg := Config{
		ServerPort:                    getEnv("SERVER_PORT", "8081"),
		Neo4jURI:                      strings.TrimSpace(os.Getenv("NEO4J_URI")),
		Neo4jUser:                     strings.TrimSpace(os.Getenv("NEO4J_USER")),
		Neo4jPassword:                 strings.TrimSpace(os.Getenv("NEO4J_PASSWORD")),
		UserServiceBaseURL:            strings.TrimRight(strings.TrimSpace(os.Getenv("USER_SERVICE_BASE_URL")), "/"),
		UserServiceRequired:           getEnvBool("USER_SERVICE_REQUIRED", false),
		ShutdownTimeout:               getEnvDurationSeconds("SHUTDOWN_TIMEOUT_SECONDS", 10),
		ExternalRequestTimeout:        getEnvDurationSeconds("EXTERNAL_REQUEST_TIMEOUT_SECONDS", 3),
		RabbitMQURL:                   strings.TrimSpace(os.Getenv("RABBITMQ_URL")),
		RabbitMQRequired:              getEnvBool("RABBITMQ_REQUIRED", false),
		FriendRequestSentExchange:     getEnv("FRIEND_REQUEST_SENT_EXCHANGE", "friend-request-sent"),
		FriendRequestAcceptedExchange: getEnv("FRIEND_REQUEST_ACCEPTED_EXCHANGE", "friend-request-accepted"),
	}

	if cfg.Neo4jURI == "" {
		return cfg, errors.New("NEO4J_URI is required")
	}

	if cfg.Neo4jUser == "" {
		return cfg, errors.New("NEO4J_USER is required")
	}

	if cfg.Neo4jPassword == "" {
		return cfg, errors.New("NEO4J_PASSWORD is required")
	}

	if cfg.UserServiceRequired && cfg.UserServiceBaseURL == "" {
		return cfg, errors.New("USER_SERVICE_BASE_URL is required when USER_SERVICE_REQUIRED=true")
	}
	if cfg.RabbitMQRequired && cfg.RabbitMQURL == "" {
		return cfg, errors.New("RABBITMQ_URL is required when RABBITMQ_REQUIRED=true")
	}

	return cfg, nil
}

func (c Config) Address() string {
	port := strings.TrimSpace(c.ServerPort)
	if port == "" {
		return ":8081"
	}

	if strings.HasPrefix(port, ":") {
		return port
	}

	return ":" + port
}

func getEnv(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	return value
}

func getEnvBool(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func getEnvDurationSeconds(key string, fallback int) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return time.Duration(fallback) * time.Second
	}

	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return time.Duration(fallback) * time.Second
	}

	return time.Duration(parsed) * time.Second
}
