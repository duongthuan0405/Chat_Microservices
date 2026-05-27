using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using ChatService.Application.ExternalServices;
using ChatService.Presentation.Hubs;
using ChatService.Application.Features.Messages.Commands.SendMessage;
using ChatService.Application.Features.Messages.Commands.EditMessage;
using ChatService.Application.Features.Messages.Commands.SoftDeleteMessage;

namespace ChatService.Infrastructure.ExternalServices;

public class MessageHubPublisher : IMessageHubPublisher
{
    private readonly IHubContext<ChatHub> _hubContext;

    // Centralized event names to avoid magic strings in the system
    private const string ReceiveMessageEvent = "ReceiveMessage";
    private const string NewMessageNotificationEvent = "NewMessageNotification";
    private const string MessageEditedEvent = "MessageEdited";
    private const string MessageDeletedEvent = "MessageDeleted";
    private const string MessageReadEvent = "MessageRead";

    public MessageHubPublisher(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task PublishReceiveMessageAsync(Guid conversationId, SendMessageCommandResponse message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(conversationId.ToString()).SendAsync(ReceiveMessageEvent, message, cancellationToken);
    }

    public async Task PublishNewMessageNotificationAsync(Guid userId, SendMessageCommandResponse message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync(NewMessageNotificationEvent, message, cancellationToken);
    }

    public async Task PublishMessageEditedAsync(Guid conversationId, EditMessageCommandResponse message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(conversationId.ToString()).SendAsync(MessageEditedEvent, message, cancellationToken);
    }

    public async Task PublishMessageDeletedAsync(Guid conversationId, SoftDeleteMessageCommandResponse message, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(conversationId.ToString()).SendAsync(MessageDeletedEvent, message, cancellationToken);
    }

    public async Task PublishMessageReadAsync(Guid conversationId, MessageReadEvent status, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group(conversationId.ToString()).SendAsync(MessageReadEvent, status, cancellationToken);
    }
}
