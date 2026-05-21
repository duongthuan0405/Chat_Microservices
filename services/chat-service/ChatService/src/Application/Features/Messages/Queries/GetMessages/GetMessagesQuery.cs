using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Enums;
using ChatService.Domain.Entities;
using ChatService.Application.Common.Models;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence;
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
    public bool IsRead { get; set; }
    public List<Guid> ReadBy { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, PagedResult<GetMessagesResponse>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationServiceClient _conversationServiceClient;
    private readonly IMessageReadStatusRepository _messageReadStatusRepository;
    private readonly IMessageHubPublisher _messageHubPublisher;
    private readonly IUnitOfWork _unitOfWork;

    public GetMessagesQueryHandler(
        IMessageRepository messageRepository,
        IConversationServiceClient conversationServiceClient,
        IMessageReadStatusRepository messageReadStatusRepository,
        IMessageHubPublisher messageHubPublisher,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _conversationServiceClient = conversationServiceClient;
        _messageReadStatusRepository = messageReadStatusRepository;
        _messageHubPublisher = messageHubPublisher;
        _unitOfWork = unitOfWork;
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

        // Mark as read up to the current moment (now)
        var now = DateTimeOffset.UtcNow;

        try
        {
            await _unitOfWork.BeginAsync();

            var readStatus = await _messageReadStatusRepository.GetByConversationAndUserAsync(
                request.ConversationId,
                request.UserId,
                cancellationToken);

            if (readStatus == null)
            {
                readStatus = new MessageReadStatus.MessageReadStatusBuilder()
                    .WithConversationId(request.ConversationId)
                    .WithUserId(request.UserId)
                    .WithLastReadAt(now)
                    .Build();

                await _messageReadStatusRepository.AddAsync(readStatus, cancellationToken);
            }
            else
            {
                readStatus.UpdateReadStatus(now);
                await _messageReadStatusRepository.UpdateAsync(readStatus, cancellationToken);
            }

            await _unitOfWork.FinishAsync();

            // Broadcast real-time message read event to other users
            var readEvent = new MessageReadEvent
            {
                Id = readStatus.Id,
                ConversationId = readStatus.ConversationId,
                UserId = readStatus.UserId,
                LastReadAt = readStatus.LastReadAt
            };
            await _messageHubPublisher.PublishMessageReadAsync(request.ConversationId, readEvent, cancellationToken);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }

        // Fetch all read statuses for this conversation to see who has read our messages
        var allReadStatuses = await _messageReadStatusRepository.GetByConversationAsync(
            request.ConversationId,
            cancellationToken);

        var responseList = pagedMessages.Items.Select(message =>
        {
            var isRead = message.SenderId == request.UserId || message.CreatedAt <= now;

            var readBy = new List<Guid>();
            if (message.SenderId == request.UserId)
            {
                // Own message: get other conversation members who have read up to or past message.CreatedAt
                readBy = allReadStatuses
                    .Where(x => x.UserId != request.UserId && x.LastReadAt >= message.CreatedAt)
                    .Select(x => x.UserId)
                    .ToList();
            }

            return new GetMessagesResponse
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                Content = message.Content,
                Type = message.Type,
                IsDeleted = message.IsDeleted,
                IsRead = isRead,
                ReadBy = readBy,
                CreatedAt = message.CreatedAt,
                UpdatedAt = message.UpdatedAt
            };
        }).ToList();

        return new PagedResult<GetMessagesResponse>(
            responseList, 
            pagedMessages.TotalCount, 
            pagedMessages.PageNumber, 
            pagedMessages.PageSize);
    }
}
