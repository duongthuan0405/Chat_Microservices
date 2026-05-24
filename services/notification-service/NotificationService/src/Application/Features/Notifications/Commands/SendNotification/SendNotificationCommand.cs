using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Common.Utils;
using NotificationService.Application.Exceptions;
using NotificationService.Application.ExternalServices;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;
using Serilog;

namespace NotificationService.Application.Features.Notifications.Commands.SendNotification;

public class SendNotificationCommand : IRequest<SendNotificationCommandResponse>
{
    public Guid UserId { get; set; }
    public string TemplateCode { get; set; } = null!;
    public Dictionary<string, string> Parameters { get; set; } = new();
}

public class SendNotificationCommandResponse
{
    public Guid HistoryId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DeliveryStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}

public class SendNotificationCommandHandler : IRequestHandler<SendNotificationCommand, SendNotificationCommandResponse>
{
    private readonly INotificationPreferenceRepository _preferenceRepository;
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly INotificationHistoryRepository _historyRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRealtimeService _realtimeService;

    public SendNotificationCommandHandler(
        INotificationPreferenceRepository preferenceRepository,
        INotificationTemplateRepository templateRepository,
        INotificationHistoryRepository historyRepository,
        IUnitOfWork unitOfWork,
        IRealtimeService realtimeService)
    {
        _preferenceRepository = preferenceRepository;
        _templateRepository = templateRepository;
        _historyRepository = historyRepository;
        _unitOfWork = unitOfWork;
        _realtimeService = realtimeService;
    }

    public async Task<SendNotificationCommandResponse> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            // 1. Check template
            var template = await _templateRepository.GetByCodeAsync(request.TemplateCode, cancellationToken);
            if (template == null)
            {
                throw new NotFoundException($"Notification template with code '{request.TemplateCode}' was not found.");
            }

            if (!template.IsActive)
            {
                throw new BadRequestException($"Notification template with code '{request.TemplateCode}' is inactive.");
            }

            // 2. Render Title & Content using our StringExtensions utility
            var title = template.TitleTemplate.Render(request.Parameters);
            var content = template.BodyTemplate.Render(request.Parameters);

            // 3. Check User Preference
            var preference = await _preferenceRepository.GetByUserIdAsync(request.UserId, cancellationToken);

            var historyBuilder = new NotificationHistory.NotificationHistoryBuilder()
                .WithUserId(request.UserId)
                .WithTitle(title)
                .WithContent(content);

            if (preference != null && !preference.EnablePush)
            {
                // User disabled push notification, mark as failed with descriptive message
                var disabledHistory = historyBuilder
                    .WithStatus(DeliveryStatus.Failed)
                    .WithErrorMessage("Push notification is disabled in the user's preference settings.")
                    .Build();

                await _historyRepository.AddAsync(disabledHistory, cancellationToken);
                await _unitOfWork.FinishAsync();

                return new SendNotificationCommandResponse
                {
                    HistoryId = disabledHistory.Id,
                    UserId = disabledHistory.UserId,
                    Title = disabledHistory.Title,
                    Content = disabledHistory.Content,
                    Status = disabledHistory.Status,
                    ErrorMessage = disabledHistory.ErrorMessage,
                    CreatedAt = disabledHistory.CreatedAt,
                    SentAt = disabledHistory.SentAt
                };
            }

            // 4. Delivery Flow via SignalR
            var successHistory = historyBuilder
                .WithStatus(DeliveryStatus.Sent)
                .WithSentAt(DateTimeOffset.UtcNow)
                .Build();

            await _historyRepository.AddAsync(successHistory, cancellationToken);
            await _unitOfWork.FinishAsync();

            // Try pushing notification via SignalR as an out-of-band side-effect after successful DB persist
            try
            {
                await _realtimeService.SendToUserAsync(
                    request.UserId,
                    "ReceiveNotification",
                    new
                    {
                        id = successHistory.Id,
                        userId = successHistory.UserId,
                        title = successHistory.Title,
                        content = successHistory.Content,
                        createdAt = successHistory.CreatedAt
                    },
                    cancellationToken);
            }
            catch (Exception ex)
            {
                // Push failure shouldn't fail the business operation since the history log is safely committed
                Log.Warning(ex, "Failed to push real-time notification to user {UserId} via SignalR.", request.UserId);
            }

            return new SendNotificationCommandResponse
            {
                HistoryId = successHistory.Id,
                UserId = successHistory.UserId,
                Title = successHistory.Title,
                Content = successHistory.Content,
                Status = successHistory.Status,
                ErrorMessage = successHistory.ErrorMessage,
                CreatedAt = successHistory.CreatedAt,
                SentAt = successHistory.SentAt
            };
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
