using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using ChatService.Presentation.Middleware;

namespace ChatService.Presentation.Extensions;

public static class MiddlewareExtensions
{
    public static IServiceCollection AddMiddlewares(this IServiceCollection services)
    {
        services.AddTransient<GlobalExceptionHandler>();
        
        return services;
    }

    public static WebApplication UseMiddlewarePipeline(this WebApplication app)
    {
        app.UseMiddleware<GlobalExceptionHandler>();

        // app.UseHttpsRedirection();

        app.UseAuthorization();

        return app;
    }
}
