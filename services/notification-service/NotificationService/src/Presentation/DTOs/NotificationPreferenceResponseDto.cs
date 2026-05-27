using System;

namespace NotificationService.Presentation.DTOs;

public class NotificationPreferenceResponseDto
{
    public Guid UserId { get; set; }
    public bool EnablePush { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
