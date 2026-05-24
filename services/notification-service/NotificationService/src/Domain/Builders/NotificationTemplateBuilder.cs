using System;

namespace NotificationService.Domain.Entities;

public partial class NotificationTemplate
{
    public class NotificationTemplateBuilder
    {
        private NotificationTemplate o = null!;

        public NotificationTemplateBuilder()
        {
            Reset();
        }

        public void Reset() => o = new NotificationTemplate();

        public NotificationTemplateBuilder WithId(Guid? id)
        {
            o.Id = id ?? Guid.NewGuid();
            return this;
        }

        public NotificationTemplateBuilder WithCode(string code)
        {
            o.Code = code;
            return this;
        }

        public NotificationTemplateBuilder WithTitleTemplate(string titleTemplate)
        {
            o.TitleTemplate = titleTemplate;
            return this;
        }

        public NotificationTemplateBuilder WithBodyTemplate(string bodyTemplate)
        {
            o.BodyTemplate = bodyTemplate;
            return this;
        }

        public NotificationTemplateBuilder WithIsActive(bool isActive = true)
        {
            o.IsActive = isActive;
            return this;
        }

        public NotificationTemplateBuilder WithCreatedAt(DateTimeOffset createdAt)
        {
            o.CreatedAt = createdAt;
            return this;
        }

        public NotificationTemplateBuilder WithUpdatedAt(DateTimeOffset updatedAt)
        {
            o.UpdatedAt = updatedAt;
            return this;
        }

        public NotificationTemplate Build()
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
