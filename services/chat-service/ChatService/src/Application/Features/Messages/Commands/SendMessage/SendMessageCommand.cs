using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ChatService.Domain.Entities;
using ChatService.Domain.Enums;
using ChatService.Application.Exceptions;
using ChatService.Application.ExternalServices;
using ChatService.Application.Persistence;
using ChatService.Application.Persistence.Repositories;

namespace ChatService.Application.Features.Messages.Commands.SendMessage;

public class SendMessageCommand : IRequest<SendMessageCommandResponse>
{
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = null!;
    public MessageType Type { get; set; }
}

public class SendMessageCommandResponse
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

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, SendMessageCommandResponse>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationServiceClient _conversationServiceClient;
    private readonly IMessageHubPublisher _messageHubPublisher;
    private readonly IUnitOfWork _unitOfWork;

    public SendMessageCommandHandler(
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

    public async Task<SendMessageCommandResponse> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        if (!await _conversationServiceClient.IsMemberAsync(request.ConversationId, request.SenderId, cancellationToken))
        {
            throw new ForbiddenException("You do not have permission to send a message to this conversation.");
        }

        try
        {
            await _unitOfWork.BeginAsync();

            var message = new Message.MessageBuilder()
                .WithConversationId(request.ConversationId)
                .WithSenderId(request.SenderId)
                .WithContent(request.Content)
                .WithType(request.Type)
                .Build();

            await _messageRepository.AddAsync(message, cancellationToken);
            await _unitOfWork.FinishAsync();

            var response = new SendMessageCommandResponse
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

            // Broadcast real-time message to the conversation group using the strongly-typed publisher
            await _messageHubPublisher.PublishReceiveMessageAsync(message.ConversationId, response, cancellationToken);

            // Fetch members of the conversation to broadcast new message notifications (for sidebar updates)
            var memberIds = await _conversationServiceClient.GetMemberIdsAsync(message.ConversationId, cancellationToken);
            if (memberIds != null)
            {
                var notificationTasks = new List<Task>();
                foreach (var memberId in memberIds)
                {
                    // Don't send sidebar notification to the sender themselves
                    if (memberId != message.SenderId)
                    {
                        notificationTasks.Add(_messageHubPublisher.PublishNewMessageNotificationAsync(memberId, response, cancellationToken));
                    }
                }
                await Task.WhenAll(notificationTasks);
            }

            return response;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}

