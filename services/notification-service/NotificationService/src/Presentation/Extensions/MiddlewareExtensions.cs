using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Presentation.Middleware;

namespace NotificationService.Presentation.Extensions;

public static class MiddlewareExtensions
{
    // Gom tất cả các đăng ký DI của Middleware vào đây
    public static IServiceCollection AddMiddlewares(this IServiceCollection services)
    {
        services.AddTransient<GlobalExceptionHandler>();
        
        return services;
    }

    // Gom tất cả các Use (Middleware Pipeline) vào đây, kể cả các middleware có sẵn
    public static WebApplication UseMiddlewarePipeline(this WebApplication app)
    {
        // 1. Bắt lỗi toàn cục ở đầu pipeline
        app.UseMiddleware<GlobalExceptionHandler>();

        // 2. Swagger middleware
        app.UseSwaggerServices(app.Environment);

        // // 3. Hướng lưu lượng http sang https
        // app.UseHttpsRedirection();

        // 4. Ủy quyền bảo mật
        app.UseAuthorization();

        return app;
    }
}
