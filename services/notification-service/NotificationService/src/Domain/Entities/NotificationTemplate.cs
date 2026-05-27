using System;

namespace NotificationService.Domain.Entities;

public partial class NotificationTemplate
{
    private Guid _id;
    private string _code = null!;
    private string _titleTemplate = null!;
    private string _bodyTemplate = null!;
    private bool _isActive = true;
    private DateTimeOffset _createdAt;
    private DateTimeOffset _updatedAt;

    // Parameterless constructor is private to enforce initialization via Builder
    private NotificationTemplate()
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

    public string Code
    {
        get => _code;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Code cannot be null or empty.", nameof(value));
            _code = value;
        }
    }

    public string TitleTemplate
    {
        get => _titleTemplate;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("TitleTemplate cannot be null or empty.", nameof(value));
            _titleTemplate = value;
        }
    }

    public string BodyTemplate
    {
        get => _bodyTemplate;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("BodyTemplate cannot be null or empty.", nameof(value));
            _bodyTemplate = value;
        }
    }

    public bool IsActive
    {
        get => _isActive;
        set => _isActive = value;
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

    public DateTimeOffset UpdatedAt
    {
        get => _updatedAt;
        set
        {
            if (value == default)
                throw new ArgumentException("UpdatedAt must be a valid date.", nameof(value));
            _updatedAt = value;
        }
    }
}
