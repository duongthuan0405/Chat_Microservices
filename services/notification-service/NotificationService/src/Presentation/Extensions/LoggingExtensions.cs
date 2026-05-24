using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace NotificationService.Presentation.Extensions;

public static class LoggingExtensions
{
    public static void AddSerilogLogging(this IHostBuilder host)
    {
        // Initialize Serilog Logger
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(
                path: "Logs/notification-service-.log",
                rollingInterval: RollingInterval.Day,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        // Register Serilog as the logging provider on the Host
        host.UseSerilog();
    }
}
