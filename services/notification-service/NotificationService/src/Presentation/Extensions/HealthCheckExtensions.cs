using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;

namespace NotificationService.Presentation.Extensions;

public static class HealthCheckExtensions
{
    public static WebApplication MapCustomHealthChecks(this WebApplication app)
    {
        // 1. Liveness Check: Chỉ cần ứng dụng khởi động thành công và phản hồi
        app.MapHealthChecks("/live", new HealthCheckOptions
        {
            Predicate = _ => false, // Không chạy bất kỳ bộ kiểm tra dependency nào (Database, RabbitMQ)
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var response = new
                {
                    status = "Healthy",
                    message = "Notification Service is alive!"
                };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        });

        // 2. Readiness Check: Kiểm tra toàn diện các kết nối Database và RabbitMQ (các service có tag "ready")
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

        // 3. Giữ lại endpoint /health chung nếu cần kiểm tra toàn bộ
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
