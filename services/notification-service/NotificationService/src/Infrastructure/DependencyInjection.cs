using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Repositories;

namespace NotificationService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Read environment variables for PostgreSQL
        var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
        var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
        var dbUser = Environment.GetEnvironmentVariable("DB_USERNAME") ?? "thuanduong";
        var dbPass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "duongthuan@123";
        var dbName = Environment.GetEnvironmentVariable("DB_DATABASE") ?? "notification_db";

        var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};Include Error Detail=true";
        // Register EF Core DbContext for PostgreSQL
        services.AddDbContext<NotificationDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Repositories
        services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
        services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
        services.AddScoped<INotificationHistoryRepository, NotificationHistoryRepository>();

        return services;
    }
}
