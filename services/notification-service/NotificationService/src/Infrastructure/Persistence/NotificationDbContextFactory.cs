using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NotificationService.Infrastructure.Persistence;

public class NotificationDbContextFactory : IDesignTimeDbContextFactory<NotificationDbContext>
{
    public NotificationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<NotificationDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=notification_db;Username=postgres;Password=postgres;Include Error Detail=true");

        return new NotificationDbContext(optionsBuilder.Options);
    }
}
