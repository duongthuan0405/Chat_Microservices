using System.Collections.Generic;
using System.Threading.Tasks;
using MassTransit;
using MediatR;
using NotificationService.Application.Common.Events;
using NotificationService.Application.Features.Notifications.Commands.SendNotification;

namespace NotificationService.Presentation.Consumers;

public class FriendRequestSentConsumer : IConsumer<FriendRequestSentIntegrationEvent>
{
    private readonly ISender _sender;

    public FriendRequestSentConsumer(ISender sender)
    {
        _sender = sender;
    }

    public async Task Consume(ConsumeContext<FriendRequestSentIntegrationEvent> context)
    {
        var message = context.Message;

        var command = new SendNotificationCommand
        {
            UserId = message.ReceiverId,
            TemplateCode = "FRIEND_REQUEST_RECEIVED",
            Parameters = new Dictionary<string, string>
            {
                { "SenderName", message.SenderName }
            }
        };

        await _sender.Send(command);
    }
}
