using System;
using System.Threading;
using System.Threading.Tasks;
using ChatService.Application.Features.Messages.Commands.SendMessage;
using ChatService.Application.Features.Messages.Commands.EditMessage;
using ChatService.Application.Features.Messages.Commands.SoftDeleteMessage;
using ChatService.Application.Features.Messages.Commands.MarkMessageAsRead;

namespace ChatService.Application.ExternalServices;

public interface IMessageHubPublisher
{
    Task PublishReceiveMessageAsync(Guid conversationId, SendMessageCommandResponse message, CancellationToken cancellationToken = default);
    Task PublishNewMessageNotificationAsync(Guid userId, SendMessageCommandResponse message, CancellationToken cancellationToken = default);
    Task PublishMessageEditedAsync(Guid conversationId, EditMessageCommandResponse message, CancellationToken cancellationToken = default);
    Task PublishMessageDeletedAsync(Guid conversationId, SoftDeleteMessageCommandResponse message, CancellationToken cancellationToken = default);
    Task PublishMessageReadAsync(Guid conversationId, MarkMessageAsReadCommandResponse status, CancellationToken cancellationToken = default);
}
