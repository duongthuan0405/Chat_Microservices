package client

import (
	"context"
	"conversation-service/internal/domain"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type UserClient struct {
	baseURL  string
	required bool
	client   *http.Client
}

type userProfileResponse struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	Name        string `json:"name"`
	PhoneNumber string `json:"phoneNumber"`
	AvatarURL   string `json:"avatarUrl"`
	Gender      string `json:"gender"`
	Message     string `json:"message"`
}

func NewUserClient(baseURL string, required bool, timeout time.Duration) *UserClient {
	return &UserClient{
		baseURL:  strings.TrimRight(baseURL, "/"),
		required: required,
		client: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *UserClient) GetProfile(ctx context.Context, userID string) (domain.UserProfile, error) {
	userID = strings.TrimSpace(userID)

	if userID == "" {
		return domain.UserProfile{}, errors.New("user id is required")
	}

	if c.baseURL == "" {
		if c.required {
			return domain.UserProfile{}, errors.New("user-service is required but USER_SERVICE_BASE_URL is empty")
		}

		return domain.UserProfile{
			ID:          userID,
			Email:       "",
			Name:        userID,
			PhoneNumber: "",
			AvatarURL:   "",
			Gender:      "",
		}, nil
	}

	endpoint := fmt.Sprintf("%s/api/profile/%s", c.baseURL, url.PathEscape(userID))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return domain.UserProfile{}, err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Internal-Service", "conversation-service")

	resp, err := c.client.Do(req)
	if err != nil {
		return domain.UserProfile{}, fmt.Errorf("failed to call user-service: %w", err)
	}
	defer resp.Body.Close()

	var body userProfileResponse
	_ = json.NewDecoder(resp.Body).Decode(&body)

	if resp.StatusCode == http.StatusNotFound {
		if strings.TrimSpace(body.Message) != "" {
			return domain.UserProfile{}, errors.New(body.Message)
		}

		return domain.UserProfile{}, fmt.Errorf("user %s does not exist", userID)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if strings.TrimSpace(body.Message) != "" {
			return domain.UserProfile{}, errors.New(body.Message)
		}

		return domain.UserProfile{}, fmt.Errorf("user-service returned status %d", resp.StatusCode)
	}

	profileID := strings.TrimSpace(body.ID)
	if profileID == "" {
		return domain.UserProfile{}, errors.New("user-service response missing id")
	}

	name := strings.TrimSpace(body.Name)
	if name == "" {
		name = profileID
	}

	return domain.UserProfile{
		ID:          profileID,
		Email:       strings.TrimSpace(body.Email),
		Name:        name,
		PhoneNumber: strings.TrimSpace(body.PhoneNumber),
		AvatarURL:   strings.TrimSpace(body.AvatarURL),
		Gender:      strings.TrimSpace(body.Gender),
	}, nil
}
