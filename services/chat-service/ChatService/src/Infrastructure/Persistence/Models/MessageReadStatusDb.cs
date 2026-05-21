using System;

namespace ChatService.Infrastructure.Persistence.Models;

public class MessageReadStatusDb
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public Guid LastReadMessageId { get; set; }
    public DateTimeOffset ReadAt { get; set; }
}
