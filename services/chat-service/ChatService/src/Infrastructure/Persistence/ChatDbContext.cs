using Microsoft.EntityFrameworkCore;
using ChatService.Infrastructure.Persistence.Models;

namespace ChatService.Infrastructure.Persistence;

public class ChatDbContext : DbContext
{
    public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options)
    {
    }

    public DbSet<MessageDb> Messages => Set<MessageDb>();
    public DbSet<MessageReadStatusDb> MessageReadStatuses => Set<MessageReadStatusDb>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ChatDbContext).Assembly);
    }
}
