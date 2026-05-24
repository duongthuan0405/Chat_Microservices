using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ChatService.Infrastructure.Persistence.Models;

namespace ChatService.Infrastructure.Persistence.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<MessageDb>
{
    public void Configure(EntityTypeBuilder<MessageDb> builder)
    {
        builder.ToTable("Message");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(x => x.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.HasIndex(x => new { x.ConversationId, x.CreatedAt });
        builder.HasIndex(x => x.SenderId);
    }
}
