using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Entities;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Commands.MarkMessageAsRead;

public class MarkMessageAsReadCommand : IRequest<MarkMessageAsReadCommandResponse>
{
    public Guid UserId { get; set; }
    public Guid MessageId { get; set; }
}

public class MarkMessageAsReadCommandResponse
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset LastReadAt { get; set; }
}

public class MarkMessageAsReadCommandHandler : IRequestHandler<MarkMessageAsReadCommand, MarkMessageAsReadCommandResponse>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageReadStatusRepository _messageReadStatusRepository;
    private readonly IConversationServiceClient _conversationServiceClient;
    private readonly IMessageHubPublisher _messageHubPublisher;
    private readonly IUnitOfWork _unitOfWork;

    public MarkMessageAsReadCommandHandler(
        IMessageRepository messageRepository,
        IMessageReadStatusRepository messageReadStatusRepository,
        IConversationServiceClient conversationServiceClient,
        IMessageHubPublisher messageHubPublisher,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _messageReadStatusRepository = messageReadStatusRepository;
        _conversationServiceClient = conversationServiceClient;
        _messageHubPublisher = messageHubPublisher;
        _unitOfWork = unitOfWork;
    }

    public async Task<MarkMessageAsReadCommandResponse> Handle(MarkMessageAsReadCommand request, CancellationToken cancellationToken)
    {
        var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null)
        {
            throw new NotFoundException($"Message with ID '{request.MessageId}' was not found.");
        }

        if (!await _conversationServiceClient.IsMemberAsync(message.ConversationId, request.UserId, cancellationToken))
        {
            throw new ForbiddenException("You do not have permission to mark messages as read in this conversation.");
        }

        try
        {
            await _unitOfWork.BeginAsync();

            var status = await _messageReadStatusRepository.GetByConversationAndUserAsync(
                message.ConversationId, 
                request.UserId, 
                cancellationToken);

            if (status == null)
            {
                status = new MessageReadStatus.MessageReadStatusBuilder()
                    .WithConversationId(message.ConversationId)
                    .WithUserId(request.UserId)
                    .WithLastReadAt(DateTimeOffset.UtcNow)
                    .Build();

                await _messageReadStatusRepository.AddAsync(status, cancellationToken);
            }
            else
            {
                status.UpdateReadStatus(DateTimeOffset.UtcNow);
                await _messageReadStatusRepository.UpdateAsync(status, cancellationToken);
            }

            await _unitOfWork.FinishAsync();

            var response = new MarkMessageAsReadCommandResponse
            {
                Id = status.Id,
                ConversationId = status.ConversationId,
                UserId = status.UserId,
                LastReadAt = status.LastReadAt
            };

            // Broadcast real-time message read event using strongly-typed publisher
            var readEvent = new MessageReadEvent
            {
                Id = status.Id,
                ConversationId = status.ConversationId,
                UserId = status.UserId,
                LastReadAt = status.LastReadAt
            };
            await _messageHubPublisher.PublishMessageReadAsync(status.ConversationId, readEvent, cancellationToken);

            return response;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}

