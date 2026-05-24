using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Persistence.Configurations;

public class NotificationHistoryConfiguration : IEntityTypeConfiguration<NotificationHistoryModel>
{
    public void Configure(EntityTypeBuilder<NotificationHistoryModel> builder)
    {
        builder.ToTable("NotificationHistory");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.HasIndex(x => x.UserId);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.Content)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>(); // Save enum as string in DB for readability!

        builder.Property(x => x.IsRead)
            .HasDefaultValue(false);

        builder.Property(x => x.RetryCount)
            .HasDefaultValue(0);
    }
}
