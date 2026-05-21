using System;
using ChatService.Domain.Exceptions;

namespace ChatService.Domain.Entities;

public partial class MessageReadStatus
{
    private MessageReadStatus()
    {
    }

    public Guid Id { get; private set; }
    public Guid ConversationId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTimeOffset LastReadAt { get; private set; }

    public void UpdateReadStatus(DateTimeOffset lastReadAt)
    {
        LastReadAt = lastReadAt;
    }

    public class MessageReadStatusBuilder
    {
        private Guid _id = Guid.NewGuid();
        private Guid _conversationId;
        private Guid _userId;
        private DateTimeOffset _lastReadAt = DateTimeOffset.UtcNow;

        public MessageReadStatusBuilder WithId(Guid id)
        {
            _id = id;
            return this;
        }

        public MessageReadStatusBuilder WithConversationId(Guid conversationId)
        {
            _conversationId = conversationId;
            return this;
        }

        public MessageReadStatusBuilder WithUserId(Guid userId)
        {
            _userId = userId;
            return this;
        }

        public MessageReadStatusBuilder WithLastReadAt(DateTimeOffset lastReadAt)
        {
            _lastReadAt = lastReadAt;
            return this;
        }

        public MessageReadStatus Build()
        {
            if (_conversationId == Guid.Empty)
            {
                throw new DomainException("ConversationId cannot be empty.");
            }

            if (_userId == Guid.Empty)
            {
                throw new DomainException("UserId cannot be empty.");
            }

            return new MessageReadStatus
            {
                Id = _id,
                ConversationId = _conversationId,
                UserId = _userId,
                LastReadAt = _lastReadAt
            };
        }
    }
}
