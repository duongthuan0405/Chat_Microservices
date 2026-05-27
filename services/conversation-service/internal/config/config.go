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
	ServerPort             string
	PostgresDSN            string
	UserServiceBaseURL     string
	UserServiceRequired    bool
	ShutdownTimeout        time.Duration
	ExternalRequestTimeout time.Duration
	RabbitMQURL              string
	RabbitMQRequired         bool
	AddedToGroupChatExchange string
}

func Load() (Config, error) {
	_ = godotenv.Load("conversation.env")
	_ = godotenv.Load(".env")

	cfg := Config{
		ServerPort:               getEnv("SERVER_PORT", "8083"),
		PostgresDSN:              strings.TrimSpace(os.Getenv("POSTGRES_DSN")),
		UserServiceBaseURL:       strings.TrimRight(strings.TrimSpace(os.Getenv("USER_SERVICE_BASE_URL")), "/"),
		UserServiceRequired:      getEnvBool("USER_SERVICE_REQUIRED", false),
		ShutdownTimeout:          getEnvDurationSeconds("SHUTDOWN_TIMEOUT_SECONDS", 10),
		ExternalRequestTimeout:   getEnvDurationSeconds("EXTERNAL_REQUEST_TIMEOUT_SECONDS", 3),
		RabbitMQURL:              strings.TrimSpace(os.Getenv("RABBITMQ_URL")),
		RabbitMQRequired:         getEnvBool("RABBITMQ_REQUIRED", false),
		AddedToGroupChatExchange: getEnv("ADDED_TO_GROUP_CHAT_EXCHANGE", "added-to-group-chat"),
}
	if cfg.PostgresDSN == "" {
		return cfg, errors.New("POSTGRES_DSN is required")
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
		return ":8083"
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
