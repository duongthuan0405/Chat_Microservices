package events

import "context"

type NoopPublisher struct{}

func NewNoopPublisher() *NoopPublisher {
	return &NoopPublisher{}
}

func (p *NoopPublisher) Publish(ctx context.Context, exchange string, payload []byte) error {
	return nil
}

func (p *NoopPublisher) Close() error {
	return nil
}