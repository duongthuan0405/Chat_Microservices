using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ChatService.Infrastructure.Persistence.Models;

namespace ChatService.Infrastructure.Persistence.Configurations;

public class MessageReadStatusConfiguration : IEntityTypeConfiguration<MessageReadStatusDb>
{
    public void Configure(EntityTypeBuilder<MessageReadStatusDb> builder)
    {
        builder.ToTable("MessageReadStatus");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new { x.ConversationId, x.UserId })
            .IsUnique();
    }
}
