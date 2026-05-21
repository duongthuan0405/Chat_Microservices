using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Application.Exceptions;
using ChatService.Application.Persistence;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Commands.SoftDeleteMessage;

public class SoftDeleteMessageCommand : IRequest<SoftDeleteMessageCommandResponse>
{
    public Guid MessageId { get; set; }
    public Guid SenderId { get; set; }
}

public class SoftDeleteMessageCommandResponse
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public bool IsDeleted { get; set; }
}

public class SoftDeleteMessageCommandHandler : IRequestHandler<SoftDeleteMessageCommand, SoftDeleteMessageCommandResponse>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageReadStatusRepository _messageReadStatusRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SoftDeleteMessageCommandHandler(
        IMessageRepository messageRepository,
        IMessageReadStatusRepository messageReadStatusRepository,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _messageReadStatusRepository = messageReadStatusRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SoftDeleteMessageCommandResponse> Handle(SoftDeleteMessageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
            if (message == null)
            {
                throw new NotFoundException($"Message with ID '{request.MessageId}' was not found.");
            }

            if (message.SenderId != request.SenderId)
            {
                throw new ForbiddenException("You do not have permission to delete this message.");
            }

            message.SoftDelete();
            await _messageRepository.UpdateAsync(message, cancellationToken);

            // Update watermarks if this message was the last read message for any users
            var readStatuses = await _messageReadStatusRepository.GetByLastReadMessageIdAsync(message.Id, cancellationToken);
            if (readStatuses != null && readStatuses.Count > 0)
            {
                var previousMessage = await _messageRepository.GetLatestBeforeAsync(
                    message.ConversationId, 
                    message.CreatedAt, 
                    cancellationToken);

                if (previousMessage != null)
                {
                    foreach (var status in readStatuses)
                    {
                        status.UpdateReadStatus(previousMessage.Id);
                        await _messageReadStatusRepository.UpdateAsync(status, cancellationToken);
                    }
                }
            }

            await _unitOfWork.FinishAsync();

            return new SoftDeleteMessageCommandResponse
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                IsDeleted = message.IsDeleted
            };
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
