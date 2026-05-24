using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Persistence.Configurations;

public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplateModel>
{
    public void Configure(EntityTypeBuilder<NotificationTemplateModel> builder)
    {
        builder.ToTable("NotificationTemplates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(100);

        // Ensure Code is unique
        builder.HasIndex(x => x.Code)
            .IsUnique();

        builder.Property(x => x.TitleTemplate)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.BodyTemplate)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        // Seed default templates directly in configurations (tied to EF migrations)
        builder.HasData(
            new NotificationTemplateModel
            {
                Id = Guid.Parse("d3b07384-d113-4a1e-a57d-df9856f61001"),
                Code = "FRIEND_REQUEST_RECEIVED",
                TitleTemplate = "{SenderName} sent you a friend request",
                BodyTemplate = "{SenderName} wants to be friends with you.",
                IsActive = true,
                CreatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new NotificationTemplateModel
            {
                Id = Guid.Parse("d3b07384-d113-4a1e-a57d-df9856f61002"),
                Code = "FRIEND_REQUEST_ACCEPTED",
                TitleTemplate = "{SenderName} accepted your friend request",
                BodyTemplate = "{SenderName} accepted your friend request. You can now chat!",
                IsActive = true,
                CreatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new NotificationTemplateModel
            {
                Id = Guid.Parse("d3b07384-d113-4a1e-a57d-df9856f61003"),
                Code = "ADDED_TO_GROUP_CHAT",
                TitleTemplate = "Added to group chat {GroupName}",
                BodyTemplate = "{AdderName} added you to the group chat {GroupName}.",
                IsActive = true,
                CreatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
