using Microsoft.EntityFrameworkCore;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Persistence;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
    {
    }

    public DbSet<NotificationPreferenceModel> Preferences { get; set; } = null!;
    public DbSet<NotificationTemplateModel> Templates { get; set; } = null!;
    //public DbSet<NotificationHistoryModel> Histories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations automatically from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NotificationDbContext).Assembly);
    }
}
