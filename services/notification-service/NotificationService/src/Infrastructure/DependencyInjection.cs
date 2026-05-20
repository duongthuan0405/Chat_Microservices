using System;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.ExternalServices;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Infrastructure.ExternalServices;
using NotificationService.Infrastructure.HealthChecks;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Repositories;
using NotificationService.Presentation.Consumers.Filters;
using NotificationService.Presentation.Events;

namespace NotificationService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddPersistence(configuration)
            .AddRepositories()
            .AddServices()
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

        // Register database health check
        services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("PostgreSQL", tags: new[] { "ready" });

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
    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IRealtimeService, SignalRRealtimeService>();
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

                // Cấu hình cơ chế tự động thử lại 6 lần, mỗi lần cách nhau 5 giây khi xử lý gặp lỗi
                cfg.UseMessageRetry(r => r.Interval(6, TimeSpan.FromSeconds(5)));

                // Bật tính năng nhận dạng JSON thô (phẳng) không cần bọc envelope của MassTransit cho MỌI tin nhắn
                cfg.UseRawJsonDeserializer(RawSerializerOptions.AnyMessageType);

                // Đăng ký bộ lọc ghi log tự động cho tất cả tin nhắn MassTransit nhận được
                cfg.UseConsumeFilter(typeof(LoggingConsumeFilter<>), context);

                // Định cấu hình Exchange Name tùy chỉnh (không phụ thuộc vào namespace C#)
                cfg.Message<FriendRequestSentIntegrationEvent>(m => m.SetEntityName("friend-request-sent"));
                cfg.Message<FriendRequestAcceptedIntegrationEvent>(m => m.SetEntityName("friend-request-accepted"));
                cfg.Message<AddedToGroupChatIntegrationEvent>(m => m.SetEntityName("added-to-group-chat"));

                cfg.ConfigureEndpoints(context);
            });
        });

        // Register RabbitMQ health check
        services.AddHealthChecks()
            .AddCheck<RabbitMqHealthCheck>("RabbitMQ", tags: new[] { "ready" });

        return services;
    }
}
