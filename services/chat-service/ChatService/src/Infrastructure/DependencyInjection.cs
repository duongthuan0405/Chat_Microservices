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
        // Read environment variables for PostgreSQL
        var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
        var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
        var dbUser = Environment.GetEnvironmentVariable("DB_USERNAME") ?? "thuanduong";
        var dbPass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "duongthuan@123";
        var dbName = Environment.GetEnvironmentVariable("DB_DATABASE") ?? "chat_db";

        var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};Include Error Detail=true";

        // Register EF Core DbContext for PostgreSQL
        services.AddDbContext<ChatDbContext>(options =>
            options.UseNpgsql(connectionString));

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
