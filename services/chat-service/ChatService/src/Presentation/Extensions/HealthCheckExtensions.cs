using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;

namespace ChatService.Presentation.Extensions;

public static class HealthCheckExtensions
{
    public static WebApplication MapCustomHealthChecks(this WebApplication app)
    {
        // 1. Liveness Check: Only checks if the service has started and is responsive
        app.MapHealthChecks("/live", new HealthCheckOptions
        {
            Predicate = _ => false, // Do not run database/broker dependency checks for liveness
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var response = new
                {
                    status = "Healthy",
                    message = "Chat Service is alive!"
                };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        });

        // 2. Readiness Check: Runs comprehensive dependency checks (e.g. PostgreSQL with tag "ready")
        app.MapHealthChecks("/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var response = new
                {
                    status = report.Status.ToString(),
                    checks = report.Entries.Select(x => new
                    {
                        name = x.Key,
                        status = x.Value.Status.ToString(),
                        description = x.Value.Description,
                        exception = x.Value.Exception?.Message
                    }),
                    duration = report.TotalDuration
                };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        });

        // 3. Keep the generic /health endpoint
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var response = new
                {
                    status = report.Status.ToString(),
                    checks = report.Entries.Select(x => new
                    {
                        name = x.Key,
                        status = x.Value.Status.ToString(),
                        description = x.Value.Description,
                        exception = x.Value.Exception?.Message
                    }),
                    duration = report.TotalDuration
                };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        });

        return app;
    }
}
