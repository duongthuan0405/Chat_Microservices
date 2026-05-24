using System;
using ChatService.Domain.Enums;

namespace ChatService.Presentation.DTOs;

public class SendMessageRequestDto
{
    public Guid ConversationId { get; set; }
    public string Content { get; set; } = null!;
    public MessageType Type { get; set; } = MessageType.Text;
}
