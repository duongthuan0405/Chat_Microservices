using System;

namespace NotificationService.Application.Common.Events;

public class AddedToGroupChatIntegrationEvent
{
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = null!;
    public Guid AdderId { get; set; }
    public string AdderName { get; set; } = null!;
    public Guid AddedUserId { get; set; } // The user who was added (the one to be notified)
    public DateTime Timestamp { get; set; }
}
