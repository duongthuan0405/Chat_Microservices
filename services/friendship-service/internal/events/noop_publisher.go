package events

import (
	"context"
	"friendship-service/internal/domain"
)

type NoopPublisher struct{}

func NewNoopPublisher() *NoopPublisher {
	return &NoopPublisher{}
}

func (p *NoopPublisher) PublishFriendRequestSent(ctx context.Context, event domain.FriendRequestSentIntegrationEvent) error {
	return nil
}

func (p *NoopPublisher) PublishFriendRequestAccepted(ctx context.Context, event domain.FriendRequestAcceptedIntegrationEvent) error {
	return nil
}
