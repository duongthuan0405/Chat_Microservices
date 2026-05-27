package client

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

type UserClient struct {
	baseURL  string
	required bool
	client   *http.Client
}

type userExistsResponse struct {
	Exists bool `json:"exists"`
}

func NewUserClient(baseURL string, required bool, timeout time.Duration) *UserClient {
	return &UserClient{
		baseURL:  baseURL,
		required: required,
		client: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *UserClient) Exists(ctx context.Context, userID string) (bool, error) {
	if c.baseURL == "" {
		if c.required {
			return false, fmt.Errorf("user-service is required but USER_SERVICE_BASE_URL is empty")
		}

		return true, nil
	}

	endpoint := fmt.Sprintf("%s/internal/users/%s/exists", c.baseURL, url.PathEscape(userID))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return false, err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Internal-Service", "friendship-service")

	resp, err := c.client.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to call user-service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return false, nil
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return false, fmt.Errorf("user-service returned status %d", resp.StatusCode)
	}

	var body userExistsResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return false, err
	}

	return body.Exists, nil
}
