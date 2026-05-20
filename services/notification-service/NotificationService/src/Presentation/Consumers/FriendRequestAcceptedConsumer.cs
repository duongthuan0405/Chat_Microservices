using System.Collections.Generic;
using System.Threading.Tasks;
using MassTransit;
using MediatR;
using NotificationService.Presentation.Events;
using NotificationService.Application.Features.Notifications.Commands.SendNotification;

namespace NotificationService.Presentation.Consumers;

public class FriendRequestAcceptedConsumer : IConsumer<FriendRequestAcceptedIntegrationEvent>
{
    private readonly ISender _sender;

    public FriendRequestAcceptedConsumer(ISender sender)
    {
        _sender = sender;
    }

    public async Task Consume(ConsumeContext<FriendRequestAcceptedIntegrationEvent> context)
    {
        var message = context.Message;

        var command = new SendNotificationCommand
        {
            UserId = message.ReceiverId,
            TemplateCode = "FRIEND_REQUEST_ACCEPTED",
            Parameters = new Dictionary<string, string>
            {
                { "SenderName", message.SenderName }
            }
        };

        await _sender.Send(command);
    }
}
