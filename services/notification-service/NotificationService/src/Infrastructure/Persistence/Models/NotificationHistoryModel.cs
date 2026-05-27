using System;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;

namespace NotificationService.Infrastructure.Persistence.Models;

public class NotificationHistoryModel
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DeliveryStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }

    public static NotificationHistoryModel FromDomain(NotificationHistory domain)
    {
        return new NotificationHistoryModel
        {
            Id = domain.Id,
            UserId = domain.UserId,
            Title = domain.Title,
            Content = domain.Content,
            IsRead = domain.IsRead,
            Status = domain.Status,
            ErrorMessage = domain.ErrorMessage,
            RetryCount = domain.RetryCount,
            CreatedAt = domain.CreatedAt.UtcDateTime,
            SentAt = domain.SentAt?.UtcDateTime
        };
    }

    public NotificationHistory ToDomain()
    {
        return new NotificationHistory.NotificationHistoryBuilder()
            .WithId(Id)
            .WithUserId(UserId)
            .WithTitle(Title)
            .WithContent(Content)
            .WithIsRead(IsRead)
            .WithStatus(Status)
            .WithErrorMessage(ErrorMessage)
            .WithRetryCount(RetryCount)
            .WithCreatedAt(new DateTimeOffset(CreatedAt, TimeSpan.Zero))
            .WithSentAt(SentAt.HasValue ? new DateTimeOffset(SentAt.Value, TimeSpan.Zero) : null)
            .Build();
    }
}
