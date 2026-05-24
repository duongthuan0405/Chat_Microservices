using System;

namespace ChatService.Presentation.DTOs;

public class MessageReadStatusResponseDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset LastReadAt { get; set; }
}
