using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Enums;
using ChatService.Application.Common.Models;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Queries.GetMessages;

public class GetMessagesQuery : IRequest<PagedResult<GetMessagesResponse>>
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

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, PagedResult<GetMessagesResponse>>
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

    public async Task<PagedResult<GetMessagesResponse>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        if (!await _conversationServiceClient.IsMemberAsync(request.ConversationId, request.UserId, cancellationToken))
        {
            throw new ForbiddenException("You do not have permission to view messages in this conversation.");
        }

        var pagedMessages = await _messageRepository.GetPagedByConversationIdAsync(
            request.ConversationId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var responseList = pagedMessages.Items.Select(message => new GetMessagesResponse
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            Content = message.Content,
            Type = message.Type,
            IsDeleted = message.IsDeleted,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt
        }).ToList();

        return new PagedResult<GetMessagesResponse>(
            responseList, 
            pagedMessages.TotalCount, 
            pagedMessages.PageNumber, 
            pagedMessages.PageSize);
    }
}



