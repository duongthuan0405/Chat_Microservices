using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Exceptions;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Enums;

namespace NotificationService.Application.Features.Notifications.Commands.MarkNotificationAsRead;

public class MarkNotificationAsReadCommand : IRequest<MarkNotificationAsReadCommandResponse>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
}

public class MarkNotificationAsReadCommandResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DeliveryStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, MarkNotificationAsReadCommandResponse>
{
    private readonly INotificationHistoryRepository _historyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkNotificationAsReadCommandHandler(
        INotificationHistoryRepository historyRepository,
        IUnitOfWork unitOfWork)
    {
        _historyRepository = historyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MarkNotificationAsReadCommandResponse> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var history = await _historyRepository.GetByIdAsync(request.Id, cancellationToken);
            if (history == null)
            {
                throw new NotFoundException($"Notification with ID '{request.Id}' was not found.");
            }

            if (history.UserId != request.UserId)
            {
                throw new UnauthorizedException("You are not authorized to mark this notification as read.");
            }

            history.IsRead = true;

            await _historyRepository.UpdateAsync(history, cancellationToken);
            await _unitOfWork.FinishAsync();

            return new MarkNotificationAsReadCommandResponse
            {
                Id = history.Id,
                UserId = history.UserId,
                Title = history.Title,
                Content = history.Content,
                IsRead = history.IsRead,
                Status = history.Status,
                CreatedAt = history.CreatedAt,
                SentAt = history.SentAt
            };
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
