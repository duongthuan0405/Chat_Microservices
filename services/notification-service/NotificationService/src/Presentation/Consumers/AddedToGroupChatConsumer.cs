using System.Collections.Generic;
using System.Threading.Tasks;
using MassTransit;
using MediatR;
using NotificationService.Presentation.Events;
using NotificationService.Application.Features.Notifications.Commands.SendNotification;

namespace NotificationService.Presentation.Consumers;

public class AddedToGroupChatConsumer : IConsumer<AddedToGroupChatIntegrationEvent>
{
    private readonly ISender _sender;

    public AddedToGroupChatConsumer(ISender sender)
    {
        _sender = sender;
    }

    public async Task Consume(ConsumeContext<AddedToGroupChatIntegrationEvent> context)
    {
        var message = context.Message;

        var command = new SendNotificationCommand
        {
            UserId = message.AddedUserId,
            TemplateCode = "ADDED_TO_GROUP_CHAT",
            Parameters = new Dictionary<string, string>
            {
                { "GroupName", message.GroupName },
                { "AdderName", message.AdderName }
            }
        };

        await _sender.Send(command);
    }
}
