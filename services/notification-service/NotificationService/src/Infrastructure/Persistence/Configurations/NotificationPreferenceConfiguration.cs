using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Persistence.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreferenceModel>
{
    public void Configure(EntityTypeBuilder<NotificationPreferenceModel> builder)
    {
        builder.ToTable("NotificationPreference");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.HasIndex(x => x.UserId)
            .IsUnique();
    }
}
