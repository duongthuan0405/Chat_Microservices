using System;

namespace NotificationService.Presentation.DTOs;

public class NotificationTemplateResponseDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
