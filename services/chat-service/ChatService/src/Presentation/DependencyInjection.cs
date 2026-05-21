using Microsoft.Extensions.DependencyInjection;
using ChatService.Presentation.Extensions;

namespace ChatService.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddSwaggerServices();

        return services;
    }
}

