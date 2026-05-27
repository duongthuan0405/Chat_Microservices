using System;

namespace NotificationService.Domain.Entities;

public partial class NotificationPreference
{
    private Guid _id;
    private Guid _userId;
    private bool _enablePush = true;
    private DateTimeOffset _createdAt;
    private DateTimeOffset _updatedAt;

    // Parameterless constructor is private to enforce initialization via Builder
    private NotificationPreference()
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

    public bool EnablePush
    {
        get => _enablePush;
        set => _enablePush = value;
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
