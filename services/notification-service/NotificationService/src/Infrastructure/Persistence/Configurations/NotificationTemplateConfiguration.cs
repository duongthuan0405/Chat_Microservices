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
    }
}
