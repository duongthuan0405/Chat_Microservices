using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Entities;
using ChatService.Domain.Enums;
using ChatService.Application.Persistence;
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
    private readonly IMessageReadStatusRepository _messageReadStatusRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetMessagesQueryHandler(
        IMessageRepository messageRepository,
        IMessageReadStatusRepository messageReadStatusRepository,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _messageReadStatusRepository = messageReadStatusRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<GetMessagesResponse>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        var messages = await _messageRepository.GetPagedByConversationIdAsync(
            request.ConversationId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (request.PageNumber == 1 && messages.Count > 0)
        {
            var latestMessage = messages.MaxBy(m => m.CreatedAt);

            if (latestMessage != null)
            {
                try
                {
                    await _unitOfWork.BeginAsync();

                    var status = await _messageReadStatusRepository.GetByConversationAndUserAsync(
                        request.ConversationId,
                        request.UserId,
                        cancellationToken);

                    if (status == null)
                    {
                        status = new MessageReadStatus.MessageReadStatusBuilder()
                            .WithConversationId(request.ConversationId)
                            .WithUserId(request.UserId)
                            .WithLastReadMessageId(latestMessage.Id)
                            .Build();

                        await _messageReadStatusRepository.AddAsync(status, cancellationToken);
                    }
                    else
                    {
                        status.UpdateReadStatus(latestMessage.Id);
                        await _messageReadStatusRepository.UpdateAsync(status, cancellationToken);
                    }

                    await _unitOfWork.FinishAsync();
                }
                catch
                {
                    await _unitOfWork.RollbackAsync();
                    throw;
                }
            }
        }

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

