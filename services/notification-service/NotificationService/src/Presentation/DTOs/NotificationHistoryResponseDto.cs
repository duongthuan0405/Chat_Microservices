using System;

namespace NotificationService.Presentation.DTOs;

public class NotificationHistoryResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public string Status { get; set; } = null!;
    public string? ErrorMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public string NotificationType { get; set; } = null!;
    public Guid? RefTo { get; set; }
}
