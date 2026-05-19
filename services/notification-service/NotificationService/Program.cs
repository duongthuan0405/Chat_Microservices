using NotificationService.Application;
using NotificationService.Infrastructure;
using NotificationService.Presentation.Extensions;
using NotificationService.Presentation.Middleware;
using DotNetEnv;
using Serilog;

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

            // Register Global Exception Handler
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddProblemDetails();

            var app = builder.Build();

            // Place Exception Handler at the absolute start of request pipeline
            app.UseExceptionHandler();

            // Configure the HTTP request pipeline via Extensions
            app.UseSwaggerServices(app.Environment);

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.MapGet("/test", (HttpContext httpContext) =>
            {
                return "Hello World!";
            })
            .WithName("GetTest");

            app.Run();
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
