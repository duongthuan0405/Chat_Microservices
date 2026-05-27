package events

import (
	"context"
	"encoding/json"
	"friendship-service/internal/domain"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQPublisher struct {
	connection              *amqp.Connection
	channel                 *amqp.Channel
	friendRequestSentEx     string
	friendRequestAcceptedEx string
}

func NewRabbitMQPublisher(url string, friendRequestSentEx string, friendRequestAcceptedEx string) (*RabbitMQPublisher, error) {
	connection, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	channel, err := connection.Channel()
	if err != nil {
		_ = connection.Close()
		return nil, err
	}

	publisher := &RabbitMQPublisher{
		connection:              connection,
		channel:                 channel,
		friendRequestSentEx:     friendRequestSentEx,
		friendRequestAcceptedEx: friendRequestAcceptedEx,
	}

	if err := publisher.declareExchange(friendRequestSentEx); err != nil {
		_ = publisher.Close()
		return nil, err
	}

	if err := publisher.declareExchange(friendRequestAcceptedEx); err != nil {
		_ = publisher.Close()
		return nil, err
	}

	return publisher, nil
}

func (p *RabbitMQPublisher) declareExchange(exchangeName string) error {
	return p.channel.ExchangeDeclare(
		exchangeName,
		"fanout",
		true,
		false,
		false,
		false,
		nil,
	)
}

func (p *RabbitMQPublisher) PublishFriendRequestSent(ctx context.Context, event domain.FriendRequestSentIntegrationEvent) error {
	return p.publish(ctx, p.friendRequestSentEx, event)
}

func (p *RabbitMQPublisher) PublishFriendRequestAccepted(ctx context.Context, event domain.FriendRequestAcceptedIntegrationEvent) error {
	return p.publish(ctx, p.friendRequestAcceptedEx, event)
}

func (p *RabbitMQPublisher) publish(ctx context.Context, exchangeName string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return p.channel.PublishWithContext(
		ctx,
		exchangeName,
		"",
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now().UTC(),
			Body:         body,
		},
	)
}

func (p *RabbitMQPublisher) Close() error {
	if p.channel != nil {
		_ = p.channel.Close()
	}

	if p.connection != nil {
		return p.connection.Close()
	}

	return nil
}
