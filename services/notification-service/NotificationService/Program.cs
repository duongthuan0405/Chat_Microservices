using NotificationService.Application;
using NotificationService.Infrastructure;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Presentation;
using NotificationService.Presentation.Hubs;
using NotificationService.Presentation.Extensions;
using NotificationService.Presentation.Middleware;
using DotNetEnv;
using Serilog;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;

namespace NotificationService;

public class Program
{
    public static void Main(string[] args)
    {
        // Load environment variables from .env.development
        Env.Load(".env.development");

        try
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure Serilog Logging via Extension
            builder.Host.AddSerilogLogging();

            Log.Information("Starting NotificationService microservice...");

            // Add services to the container.
            builder.Services.AddAuthorization();
            builder.Services.AddControllers();

            // Configure Swagger via Extensions
            builder.Services.AddSwaggerServices();

            builder.Services.AddApplicationServices();
            builder.Services.AddInfrastructureServices(builder.Configuration);
            builder.Services.AddPresentationServices();

            // Register Custom Middlewares
            builder.Services.AddMiddlewares();

            var app = builder.Build();

            // Apply migrations and seed templates on startup if required
            app.ApplyMigrations(args);

            // Configure Middleware Pipeline
            app.UseMiddlewarePipeline();

            // Health Check Endpoint: Kiểm tra toàn diện DB và RabbitMQ
            app.MapCustomHealthChecks();

            app.MapControllers();

            app.MapHub<NotificationHub>("/hubs/notifications");

            app.MapGet("/test", (HttpContext httpContext) =>
            {
                return "Hello World! I am Notification Service";
            })
            .WithName("GetTest");

            app.Run();
        }
        catch (HostAbortedException)
        {
            throw; // Let EF Core design-time host handling execute cleanly
        }
        catch (Exception ex)
        {
            // Fallback console print if Logger wasn't fully initialized
            if (Log.Logger == null || Log.Logger.GetType().Name == "SilentLogger")
            {
                Console.WriteLine($"[Fatal Error]: {ex.Message}\n{ex.StackTrace}");
            }
            else
            {
                Log.Fatal(ex, "NotificationService microservice terminated unexpectedly!");
            }
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
