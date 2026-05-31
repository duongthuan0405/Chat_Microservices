using System;
using NotificationService.Domain.Enums;

namespace NotificationService.Domain.Entities;

public partial class NotificationHistory
{
    private Guid _id;
    private Guid _userId;
    private string _title = null!;
    private string _content = null!;
    private bool _isRead = false;
    private DeliveryStatus _status = DeliveryStatus.Pending;
    private string? _errorMessage;
    private int _retryCount = 0;
    private DateTimeOffset _createdAt;
    private DateTimeOffset? _sentAt;
    private string _notificationType = null!;
    private Guid? _refTo;

    // Parameterless constructor is private to enforce initialization via Builder
    private NotificationHistory()
    {
    }

    public Guid Id
    {
        get => _id;
        set
        {
            if (value == Guid.Empty)
                throw new ArgumentException("Id cannot be empty.", nameof(value));
            _id = value;
        }
    }

    public Guid UserId
    {
        get => _userId;
        set
        {
            if (value == Guid.Empty)
                throw new ArgumentException("UserId cannot be empty.", nameof(value));
            _userId = value;
        }
    }

    public string Title
    {
        get => _title;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Title cannot be null or empty.", nameof(value));
            _title = value;
        }
    }

    public string Content
    {
        get => _content;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Content cannot be null or empty.", nameof(value));
            _content = value;
        }
    }

    public bool IsRead
    {
        get => _isRead;
        set => _isRead = value;
    }

    public DeliveryStatus Status
    {
        get => _status;
        set
        {
            if (!Enum.IsDefined(typeof(DeliveryStatus), value))
                throw new ArgumentException("Invalid DeliveryStatus value.", nameof(value));
            _status = value;
        }
    }

    public string? ErrorMessage
    {
        get => _errorMessage;
        set => _errorMessage = value;
    }

    public int RetryCount
    {
        get => _retryCount;
        set
        {
            if (value < 0)
                throw new ArgumentException("RetryCount cannot be negative.", nameof(value));
            _retryCount = value;
        }
    }

    public DateTimeOffset CreatedAt
    {
        get => _createdAt;
        set
        {
            if (value == default)
                throw new ArgumentException("CreatedAt must be a valid date.", nameof(value));
            _createdAt = value;
        }
    }

    public DateTimeOffset? SentAt
    {
        get => _sentAt;
        set
        {
            if (value.HasValue && value.Value == default)
                throw new ArgumentException("SentAt must be a valid date.", nameof(value));
            _sentAt = value;
        }
    }

    public string NotificationType
    {
        get => _notificationType;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("NotificationType cannot be null or empty.", nameof(value));
            _notificationType = value;
        }
    }

    public Guid? RefTo
    {
        get => _refTo;
        set => _refTo = value;
    }
}
