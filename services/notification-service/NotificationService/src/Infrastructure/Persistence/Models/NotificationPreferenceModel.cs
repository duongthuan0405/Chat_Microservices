using System;
using NotificationService.Domain.Entities;

namespace NotificationService.Infrastructure.Persistence.Models;

public class NotificationPreferenceModel
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public bool EnablePush { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public static NotificationPreferenceModel FromDomain(NotificationPreference domain)
    {
        return new NotificationPreferenceModel
        {
            Id = domain.Id,
            UserId = domain.UserId,
            EnablePush = domain.EnablePush,
            CreatedAt = domain.CreatedAt.UtcDateTime,
            UpdatedAt = domain.UpdatedAt.UtcDateTime
        };
    }

    public NotificationPreference ToDomain()
    {
        return new NotificationPreference.NotificationPreferenceBuilder()
            .WithId(Id)
            .WithUserId(UserId)
            .WithEnablePush(EnablePush)
            .WithCreatedAt(new DateTimeOffset(CreatedAt, TimeSpan.Zero))
            .WithUpdatedAt(new DateTimeOffset(UpdatedAt, TimeSpan.Zero))
            .Build();
    }
}
