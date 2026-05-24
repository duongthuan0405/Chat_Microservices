using System;

namespace NotificationService.Domain.Entities;

public partial class NotificationPreference
{
    public class NotificationPreferenceBuilder
    {
        private NotificationPreference o = null!;

        public NotificationPreferenceBuilder()
        {
            Reset();
        }

        public void Reset() => o = new NotificationPreference();

        public NotificationPreferenceBuilder WithId(Guid? id)
        {
            o.Id = id ?? Guid.NewGuid();
            return this;
        }

        public NotificationPreferenceBuilder WithUserId(Guid userId)
        {
            o.UserId = userId;
            return this;
        }

        public NotificationPreferenceBuilder WithEnablePush(bool enablePush = true)
        {
            o.EnablePush = enablePush;
            return this;
        }

        public NotificationPreferenceBuilder WithCreatedAt(DateTimeOffset createdAt)
        {
            o.CreatedAt = createdAt;
            return this;
        }

        public NotificationPreferenceBuilder WithUpdatedAt(DateTimeOffset updatedAt)
        {
            o.UpdatedAt = updatedAt;
            return this;
        }

        public NotificationPreference Build()
        {
            if (o.Id == Guid.Empty)
                o.Id = Guid.NewGuid();

            if (o.CreatedAt == default)
                o.CreatedAt = DateTimeOffset.UtcNow;

            if (o.UpdatedAt == default)
                o.UpdatedAt = DateTimeOffset.UtcNow;

            var builtObject = o;
            Reset();
            return builtObject;
        }
    }
}
