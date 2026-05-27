namespace NotificationService.Presentation.DTOs;

public class CreateNotificationTemplateRequestDto
{
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
}
