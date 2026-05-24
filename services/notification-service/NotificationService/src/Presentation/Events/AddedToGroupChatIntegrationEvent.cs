using System;

namespace NotificationService.Presentation.Events;

public class AddedToGroupChatIntegrationEvent
{
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = null!;
    public Guid AdderId { get; set; }
    public string AdderName { get; set; } = null!;
    public Guid AddedUserId { get; set; }
    public DateTime Timestamp { get; set; }
}
