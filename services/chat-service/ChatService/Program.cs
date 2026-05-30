using ChatService.Application;
using ChatService.Infrastructure;
using ChatService.Infrastructure.Persistence;
using ChatService.Presentation;
using ChatService.Presentation.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using DotNetEnv;

namespace ChatService;

public class Program
{
    public static void Main(string[] args)
    {
        Env.Load(".env.development");

        var builder = WebApplication.CreateBuilder(args);

        // Configure Serilog Logging via Extension
        builder.Host.AddSerilogLogging();

        // Add services to the container.
        builder.Services.AddAuthorization();
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
        builder.Services.AddOpenApi();

        builder.Services.AddApplicationServices();
        builder.Services.AddInfrastructureServices(builder.Configuration);
        builder.Services.AddPresentationServices();
        builder.Services.AddMiddlewares();

        var app = builder.Build();
        app.UseHttpMetrics(options =>
{
    options.AddCustomLabel("service", _ => "chat-service");
});

        // Apply migrations on startup if --migrate is passed
        app.ApplyMigrations(args);

        // Configure Middleware Pipeline
        app.UseMiddlewarePipeline();

        // Register custom health checks endpoint
        app.MapCustomHealthChecks();

        app.MapControllers();

        app.MapHub<ChatService.Presentation.Hubs.ChatHub>("/hubs/chat");

        app.MapGet("/test", (HttpContext httpContext) =>
        {
            return "Hello World! I am Chat Service.";
        })
        .WithName("GetTest");

        app.MapMetrics();

        app.Run();
    }
}

