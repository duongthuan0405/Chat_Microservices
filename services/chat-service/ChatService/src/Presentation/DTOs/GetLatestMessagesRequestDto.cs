using System;
using System.Collections.Generic;

namespace ChatService.Presentation.DTOs;

public class GetLatestMessagesRequestDto
{
    public List<Guid> ConversationIds { get; set; } = new();
}
