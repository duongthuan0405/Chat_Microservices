package events

import (
	"context"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQPublisher struct {
	connection *amqp.Connection
	channel    *amqp.Channel
}

func NewRabbitMQPublisher(url string, exchanges []string) (*RabbitMQPublisher, error) {
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
		connection: connection,
		channel:    channel,
	}

	for _, exchange := range exchanges {
		if err := publisher.declareExchange(exchange); err != nil {
			_ = publisher.Close()
			return nil, err
		}
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

func (p *RabbitMQPublisher) Publish(ctx context.Context, exchange string, payload []byte) error {
	return p.channel.PublishWithContext(
		ctx,
		exchange,
		"",
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now().UTC(),
			Body:         payload,
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
