using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ChatService.Application.Persistence;
using ChatService.Application.Persistence.Repositories;
using ChatService.Application.ExternalServices;
using ChatService.Infrastructure.Persistence;
using ChatService.Infrastructure.Persistence.Repositories;
using ChatService.Infrastructure.ExternalServices;
using ChatService.Infrastructure.HealthChecks;

namespace ChatService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddPersistence(configuration)
            .AddRepositories()
            .AddExternalServices();

        return services;
    }

    private static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        // Read environment variables for PostgreSQL and throw exception if missing
        var dbHost = configuration["DB_HOST"] ?? throw new InvalidOperationException("Required configuration key 'DB_HOST' is missing.");
        var dbPort = configuration["DB_PORT"] ?? throw new InvalidOperationException("Required configuration key 'DB_PORT' is missing.");
        var dbUser = configuration["DB_USERNAME"] ?? throw new InvalidOperationException("Required configuration key 'DB_USERNAME' is missing.");
        var dbPass = configuration["DB_PASSWORD"] ?? throw new InvalidOperationException("Required configuration key 'DB_PASSWORD' is missing.");
        var dbName = configuration["DB_DATABASE"] ?? throw new InvalidOperationException("Required configuration key 'DB_DATABASE' is missing.");

        var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};Include Error Detail=true";

        // Register EF Core DbContext for PostgreSQL
        services.AddDbContext<ChatDbContext>(options =>
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
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IMessageReadStatusRepository, MessageReadStatusRepository>();

        return services;
    }

    private static IServiceCollection AddExternalServices(this IServiceCollection services)
    {
        // Register Conversation Service Client (External)
        services.AddScoped<IConversationServiceClient, ConversationServiceClient>();

        // Register Strongly-Typed Message Hub Publisher
        services.AddScoped<IMessageHubPublisher, MessageHubPublisher>();

        return services;
    }
}
