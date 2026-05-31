using System;
using NotificationService.Domain.Enums;

namespace NotificationService.Domain.Entities;

public partial class NotificationHistory
{
    public class NotificationHistoryBuilder
    {
        private NotificationHistory o = null!;

        public NotificationHistoryBuilder()
        {
            Reset();
        }

        public void Reset() => o = new NotificationHistory();

        public NotificationHistoryBuilder WithId(Guid? id)
        {
            o.Id = id ?? Guid.NewGuid();
            return this;
        }

        public NotificationHistoryBuilder WithUserId(Guid userId)
        {
            o.UserId = userId;
            return this;
        }

        public NotificationHistoryBuilder WithTitle(string title)
        {
            o.Title = title;
            return this;
        }

        public NotificationHistoryBuilder WithContent(string content)
        {
            o.Content = content;
            return this;
        }

        public NotificationHistoryBuilder WithIsRead(bool isRead = false)
        {
            o.IsRead = isRead;
            return this;
        }

        public NotificationHistoryBuilder WithStatus(DeliveryStatus status = DeliveryStatus.Pending)
        {
            o.Status = status;
            return this;
        }

        public NotificationHistoryBuilder WithErrorMessage(string? errorMessage)
        {
            o.ErrorMessage = errorMessage;
            return this;
        }

        public NotificationHistoryBuilder WithRetryCount(int retryCount = 0)
        {
            o.RetryCount = retryCount;
            return this;
        }

        public NotificationHistoryBuilder WithCreatedAt(DateTimeOffset createdAt)
        {
            o.CreatedAt = createdAt;
            return this;
        }

        public NotificationHistoryBuilder WithSentAt(DateTimeOffset? sentAt)
        {
            o.SentAt = sentAt;
            return this;
        }

        public NotificationHistoryBuilder WithNotificationType(string notificationType)
        {
            o.NotificationType = notificationType;
            return this;
        }

        public NotificationHistoryBuilder WithRefTo(Guid? refTo)
        {
            o.RefTo = refTo;
            return this;
        }

        public NotificationHistory Build()
        {
            if (o.Id == Guid.Empty)
                o.Id = Guid.NewGuid();

            if (o.CreatedAt == default)
                o.CreatedAt = DateTimeOffset.UtcNow;

            var builtObject = o;
            Reset();
            return builtObject;
        }
    }
}
