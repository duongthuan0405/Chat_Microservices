using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace NotificationService.Infrastructure.Persistence;

public static class DatabaseExtensions
{
    public static WebApplication ApplyMigrations(this WebApplication app, string[] args)
    {
        var isNeedToMigrate = args.Contains("--migrate");

        if (isNeedToMigrate)
        {
            Log.Information("Running database migrations and seeding...");
            try
            {
                using (var scope = app.Services.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
                    context.Database.Migrate();
                }
                Log.Information("Database migrations and seeding completed successfully.");
                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "An error occurred during database migration/seeding.");
                Environment.Exit(1);
            }
        }

        return app;
    }
}
