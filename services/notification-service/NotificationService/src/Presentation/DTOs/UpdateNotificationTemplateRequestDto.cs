namespace NotificationService.Presentation.DTOs;

public class UpdateNotificationTemplateRequestDto
{
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
}
