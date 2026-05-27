using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ChatService.Infrastructure.Persistence;

public static class DatabaseExtensions
{
    public static WebApplication ApplyMigrations(this WebApplication app, string[] args)
    {
        var isNeedToMigrate = args.Contains("--migrate");

        if (isNeedToMigrate)
        {
            using (var scope = app.Services.CreateScope())
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("Running database migrations for ChatService...");
                try
                {
                    var context = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
                    context.Database.Migrate();
                    logger.LogInformation("Database migrations completed successfully.");
                    Environment.Exit(0);
                }
                catch (Exception ex)
                {
                    logger.LogCritical(ex, "An error occurred during database migration.");
                    Environment.Exit(1);
                }
            }
        }

        return app;
    }
}
