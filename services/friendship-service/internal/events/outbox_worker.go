package events

import (
	"context"
	"friendship-service/internal/domain"
	"log"
	"time"
)

type OutboxWorker struct {
	repo      domain.FriendshipRepository
	publisher domain.EventPublisher
	interval  time.Duration
	batchSize int
}

func NewOutboxWorker(
	repo domain.FriendshipRepository,
	publisher domain.EventPublisher,
	interval time.Duration,
	batchSize int,
) *OutboxWorker {
	return &OutboxWorker{
		repo:      repo,
		publisher: publisher,
		interval:  interval,
		batchSize: batchSize,
	}
}

func (w *OutboxWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("outbox worker stopped")
			return
		case <-ticker.C:
			w.process(ctx)
		}
	}
}

func (w *OutboxWorker) process(ctx context.Context) {
	events, err := w.repo.FetchOutboxEvents(ctx, w.batchSize)
	if err != nil {
		log.Printf("fetch outbox events error: %v", err)
		return
	}

	for _, event := range events {
		if err := w.publisher.Publish(ctx, event.Exchange, event.Payload); err != nil {
			log.Printf("publish outbox event %s error: %v", event.ID, err)

			if markErr := w.repo.MarkOutboxFailed(ctx, event.ID, err.Error()); markErr != nil {
				log.Printf("mark outbox event failed error: %v", markErr)
			}

			continue
		}

		if err := w.repo.MarkOutboxPublished(ctx, event.ID); err != nil {
			log.Printf("mark outbox event published error: %v", err)
		}
	}
}
