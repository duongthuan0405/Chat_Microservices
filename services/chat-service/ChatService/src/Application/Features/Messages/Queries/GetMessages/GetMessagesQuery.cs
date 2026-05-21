using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Enums;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Queries.GetMessages;

public class GetMessagesQuery : IRequest<List<GetMessagesResponse>>
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetMessagesResponse
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = null!;
    public MessageType Type { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, List<GetMessagesResponse>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationServiceClient _conversationServiceClient;

    public GetMessagesQueryHandler(
        IMessageRepository messageRepository,
        IConversationServiceClient conversationServiceClient)
    {
        _messageRepository = messageRepository;
        _conversationServiceClient = conversationServiceClient;
    }

    public async Task<List<GetMessagesResponse>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        if (!await _conversationServiceClient.IsMemberAsync(request.ConversationId, request.UserId, cancellationToken))
        {
            throw new ForbiddenException("You do not have permission to view messages in this conversation.");
        }

        var messages = await _messageRepository.GetPagedByConversationIdAsync(
            request.ConversationId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var responseList = new List<GetMessagesResponse>();
        foreach (var message in messages)
        {
            responseList.Add(new GetMessagesResponse
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                Content = message.Content,
                Type = message.Type,
                IsDeleted = message.IsDeleted,
                CreatedAt = message.CreatedAt,
                UpdatedAt = message.UpdatedAt
            });
        }

        return responseList;
    }
}


