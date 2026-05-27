using System;
using NotificationService.Domain.Entities;

namespace NotificationService.Infrastructure.Persistence.Models;

public class NotificationTemplateModel
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static NotificationTemplateModel FromDomain(NotificationTemplate domain)
    {
        return new NotificationTemplateModel
        {
            Id = domain.Id,
            Code = domain.Code,
            TitleTemplate = domain.TitleTemplate,
            BodyTemplate = domain.BodyTemplate,
            IsActive = domain.IsActive,
            CreatedAt = domain.CreatedAt.UtcDateTime,
            UpdatedAt = domain.UpdatedAt.UtcDateTime
        };
    }

    public NotificationTemplate ToDomain()
    {
        return new NotificationTemplate.NotificationTemplateBuilder()
            .WithId(Id)
            .WithCode(Code)
            .WithTitleTemplate(TitleTemplate)
            .WithBodyTemplate(BodyTemplate)
            .WithIsActive(IsActive)
            .WithCreatedAt(new DateTimeOffset(CreatedAt, TimeSpan.Zero))
            .WithUpdatedAt(new DateTimeOffset(UpdatedAt, TimeSpan.Zero))
            .Build();
    }
}
