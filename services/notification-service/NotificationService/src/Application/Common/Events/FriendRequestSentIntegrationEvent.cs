using System;

namespace NotificationService.Application.Common.Events;

public class FriendRequestSentIntegrationEvent
{
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = null!;
    public Guid ReceiverId { get; set; }
    public DateTime Timestamp { get; set; }
}
