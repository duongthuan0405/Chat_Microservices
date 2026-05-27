using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Enums;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Queries.GetLatestMessages;

public class GetLatestMessagesQuery : IRequest<Dictionary<Guid, GetLatestMessagesResponse>>
{
    public List<Guid> ConversationIds { get; set; } = new();
    public Guid UserId { get; set; }
}

public class GetLatestMessagesResponse
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = null!;
    public MessageType Type { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class GetLatestMessagesQueryHandler : IRequestHandler<GetLatestMessagesQuery, Dictionary<Guid, GetLatestMessagesResponse>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageReadStatusRepository _messageReadStatusRepository;
    private readonly IConversationServiceClient _conversationServiceClient;

    public GetLatestMessagesQueryHandler(
        IMessageRepository messageRepository,
        IMessageReadStatusRepository messageReadStatusRepository,
        IConversationServiceClient conversationServiceClient)
    {
        _messageRepository = messageRepository;
        _messageReadStatusRepository = messageReadStatusRepository;
        _conversationServiceClient = conversationServiceClient;
    }

    public async Task<Dictionary<Guid, GetLatestMessagesResponse>> Handle(GetLatestMessagesQuery request, CancellationToken cancellationToken)
    {
        if (request.ConversationIds == null || request.ConversationIds.Count == 0)
        {
            return new Dictionary<Guid, GetLatestMessagesResponse>();
        }

        // Security Validation: Filter only conversations that the user is actually a member of
        var allowedConversationIds = new List<Guid>();
        foreach (var convId in request.ConversationIds)
        {
            if (await _conversationServiceClient.IsMemberAsync(convId, request.UserId, cancellationToken))
            {
                allowedConversationIds.Add(convId);
            }
        }

        if (allowedConversationIds.Count == 0)
        {
            return new Dictionary<Guid, GetLatestMessagesResponse>();
        }

        // Fetch latest messages in bulk
        var latestMessages = await _messageRepository.GetLatestMessagesAsync(allowedConversationIds, cancellationToken);

        // Fetch read statuses for the current user in bulk
        var readStatuses = await _messageReadStatusRepository.GetByConversationsAndUserAsync(allowedConversationIds, request.UserId, cancellationToken);
        var readStatusDict = readStatuses.ToDictionary(x => x.ConversationId, x => x.LastReadAt);

        return latestMessages.ToDictionary(
            kvp => kvp.Key,
            kvp =>
            {
                var message = kvp.Value;
                
                // A message is read if:
                // 1. The requesting user is the sender of this message
                // 2. The message was created at or before the user's last read timestamp
                var isRead = message.SenderId == request.UserId || 
                             (readStatusDict.TryGetValue(message.ConversationId, out var lastReadAt) && 
                              message.CreatedAt <= lastReadAt);

                return new GetLatestMessagesResponse
                {
                    Id = message.Id,
                    ConversationId = message.ConversationId,
                    SenderId = message.SenderId,
                    Content = message.Content,
                    Type = message.Type,
                    IsDeleted = message.IsDeleted,
                    IsRead = isRead,
                    CreatedAt = message.CreatedAt,
                    UpdatedAt = message.UpdatedAt
                };
            });
    }
}
