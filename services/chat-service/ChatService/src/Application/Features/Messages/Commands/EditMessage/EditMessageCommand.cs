using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Enums;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Commands.EditMessage;

public class EditMessageCommand : IRequest<EditMessageCommandResponse>
{
    public Guid MessageId { get; set; }
    public Guid SenderId { get; set; }
    public string NewContent { get; set; } = null!;
}

public class EditMessageCommandResponse
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

public class EditMessageCommandHandler : IRequestHandler<EditMessageCommand, EditMessageCommandResponse>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationServiceClient _conversationServiceClient;
    private readonly IMessageHubPublisher _messageHubPublisher;
    private readonly IUnitOfWork _unitOfWork;

    public EditMessageCommandHandler(
        IMessageRepository messageRepository, 
        IConversationServiceClient conversationServiceClient,
        IMessageHubPublisher messageHubPublisher,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _conversationServiceClient = conversationServiceClient;
        _messageHubPublisher = messageHubPublisher;
        _unitOfWork = unitOfWork;
    }

    public async Task<EditMessageCommandResponse> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null)
        {
            throw new NotFoundException($"Message with ID '{request.MessageId}' was not found.");
        }

        if (message.SenderId != request.SenderId)
        {
            throw new ForbiddenException("You do not have permission to edit this message.");
        }

        try
        {
            await _unitOfWork.BeginAsync();

            message.EditContent(request.NewContent);

            await _messageRepository.UpdateAsync(message, cancellationToken);
            await _unitOfWork.FinishAsync();

            var response = new EditMessageCommandResponse
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                Content = message.Content,
                Type = message.Type,
                IsDeleted = message.IsDeleted,
                CreatedAt = message.CreatedAt,
                UpdatedAt = message.UpdatedAt
            };

            // Broadcast real-time edit event using the strongly-typed publisher
            await _messageHubPublisher.PublishMessageEditedAsync(message.ConversationId, response, cancellationToken);

            return response;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}

