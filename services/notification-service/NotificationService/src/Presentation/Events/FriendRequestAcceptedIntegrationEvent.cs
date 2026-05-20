using System;

namespace NotificationService.Presentation.Events;

public class FriendRequestAcceptedIntegrationEvent
{
    public Guid SenderId { get; set; } // The user who accepted the request
    public string SenderName { get; set; } = null!;
    public Guid ReceiverId { get; set; } // The user who originally sent the request (the one to be notified)
    public DateTime Timestamp { get; set; }
}
