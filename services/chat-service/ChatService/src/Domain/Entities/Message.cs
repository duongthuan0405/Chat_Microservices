using System;
using ChatService.Domain.Enums;
using ChatService.Domain.Exceptions;

namespace ChatService.Domain.Entities;

public partial class Message
{
    private Message()
    {
    }

    public Guid Id { get; private set; }
    public Guid ConversationId { get; private set; }
    public Guid SenderId { get; private set; }
    public string Content { get; private set; } = null!;
    public MessageType Type { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    public void EditContent(string newContent)
    {
        if (IsDeleted)
        {
            throw new DomainException("Cannot edit a deleted message.");
        }

        if (string.IsNullOrWhiteSpace(newContent))
        {
            throw new DomainException("Message content cannot be empty.");
        }

        Content = newContent;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SoftDelete()
    {
        if (IsDeleted)
        {
            return;
        }

        IsDeleted = true;
        Content = "Tin nhắn đã bị thu hồi";
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public class MessageBuilder
    {
        private Guid _id = Guid.NewGuid();
        private Guid _conversationId;
        private Guid _senderId;
        private string _content = null!;
        private MessageType _type = MessageType.Text;
        private bool _isDeleted = false;
        private DateTimeOffset _createdAt = DateTimeOffset.UtcNow;
        private DateTimeOffset? _updatedAt;

        public MessageBuilder WithId(Guid id)
        {
            _id = id;
            return this;
        }

        public MessageBuilder WithConversationId(Guid conversationId)
        {
            _conversationId = conversationId;
            return this;
        }

        public MessageBuilder WithSenderId(Guid senderId)
        {
            _senderId = senderId;
            return this;
        }

        public MessageBuilder WithContent(string content)
        {
            _content = content;
            return this;
        }

        public MessageBuilder WithType(MessageType type)
        {
            _type = type;
            return this;
        }

        public MessageBuilder WithIsDeleted(bool isDeleted)
        {
            _isDeleted = isDeleted;
            return this;
        }

        public MessageBuilder WithCreatedAt(DateTimeOffset createdAt)
        {
            _createdAt = createdAt;
            return this;
        }

        public MessageBuilder WithUpdatedAt(DateTimeOffset? updatedAt)
        {
            _updatedAt = updatedAt;
            return this;
        }


        public Message Build()
        {
            if (_conversationId == Guid.Empty)
            {
                throw new DomainException("ConversationId cannot be empty.");
            }

            if (_senderId == Guid.Empty)
            {
                throw new DomainException("SenderId cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(_content))
            {
                throw new DomainException("Message content cannot be empty.");
            }

            return new Message
            {
                Id = _id,
                ConversationId = _conversationId,
                SenderId = _senderId,
                Content = _content,
                Type = _type,
                IsDeleted = _isDeleted,
                CreatedAt = _createdAt,
                UpdatedAt = _updatedAt
            };
        }
    }
}
