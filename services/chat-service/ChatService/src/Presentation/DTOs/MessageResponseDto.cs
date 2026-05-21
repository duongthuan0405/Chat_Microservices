using System;

namespace ChatService.Presentation.DTOs;

public class MessageResponseDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = null!;
    public string Type { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
