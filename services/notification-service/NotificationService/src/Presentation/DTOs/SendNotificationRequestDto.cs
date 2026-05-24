using System;
using System.Collections.Generic;

namespace NotificationService.Presentation.DTOs;

public class SendNotificationRequestDto
{
    public Guid UserId { get; set; }
    public string TemplateCode { get; set; } = null!;
    public Dictionary<string, string> Parameters { get; set; } = new();
}
