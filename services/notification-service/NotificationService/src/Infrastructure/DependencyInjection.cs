using System;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.ExternalServices;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Infrastructure.ExternalServices;
using NotificationService.Infrastructure.Hubs;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Repositories;

namespace NotificationService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddPersistence(configuration)
            .AddRepositories()
            .AddRealTimeCommunication()
            .AddEventBus(configuration);

        return services;
    }

    private static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
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

        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Repositories
        services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
        services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
        services.AddScoped<INotificationHistoryRepository, NotificationHistoryRepository>();

        return services;
    }

    private static IServiceCollection AddRealTimeCommunication(this IServiceCollection services)
    {
        // Register SignalR & gateway integration services
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
        services.AddScoped<ISignalRService, SignalRService>();

        return services;
    }

    private static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
    {
        var rabbitHost = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
        var rabbitPort = Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672";
        var rabbitUser = Environment.GetEnvironmentVariable("RABBITMQ_USERNAME") ?? "guest";
        var rabbitPass = Environment.GetEnvironmentVariable("RABBITMQ_PASSWORD") ?? "guest";

        services.AddMassTransit(x =>
        {
            // Register all consumers in the executing assembly
            x.AddConsumers(typeof(DependencyInjection).Assembly);

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(rabbitHost, ushort.Parse(rabbitPort), "/", h =>
                {
                    h.Username(rabbitUser);
                    h.Password(rabbitPass);
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
