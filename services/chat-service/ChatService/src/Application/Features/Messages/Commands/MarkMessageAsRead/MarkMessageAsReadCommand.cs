using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Entities;
using ChatService.Application.Exceptions;
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
    public Guid LastReadMessageId { get; set; }
    public DateTimeOffset ReadAt { get; set; }
}

public class MarkMessageAsReadCommandHandler : IRequestHandler<MarkMessageAsReadCommand, MarkMessageAsReadCommandResponse>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageReadStatusRepository _messageReadStatusRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkMessageAsReadCommandHandler(
        IMessageRepository messageRepository,
        IMessageReadStatusRepository messageReadStatusRepository,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _messageReadStatusRepository = messageReadStatusRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MarkMessageAsReadCommandResponse> Handle(MarkMessageAsReadCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
            if (message == null)
            {
                throw new NotFoundException($"Message with ID '{request.MessageId}' was not found.");
            }

            var status = await _messageReadStatusRepository.GetByConversationAndUserAsync(
                message.ConversationId, 
                request.UserId, 
                cancellationToken);

            if (status == null)
            {
                status = new MessageReadStatus.MessageReadStatusBuilder()
                    .WithConversationId(message.ConversationId)
                    .WithUserId(request.UserId)
                    .WithLastReadMessageId(request.MessageId)
                    .Build();

                await _messageReadStatusRepository.AddAsync(status, cancellationToken);
            }
            else
            {
                status.UpdateReadStatus(request.MessageId);
                await _messageReadStatusRepository.UpdateAsync(status, cancellationToken);
            }

            await _unitOfWork.FinishAsync();

            return new MarkMessageAsReadCommandResponse
            {
                Id = status.Id,
                ConversationId = status.ConversationId,
                UserId = status.UserId,
                LastReadMessageId = status.LastReadMessageId,
                ReadAt = status.ReadAt
            };
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
