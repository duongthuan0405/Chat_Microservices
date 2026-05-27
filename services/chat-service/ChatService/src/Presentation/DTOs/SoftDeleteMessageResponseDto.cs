using System;

namespace ChatService.Presentation.DTOs;

public class SoftDeleteMessageResponseDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public bool IsDeleted { get; set; }
}
