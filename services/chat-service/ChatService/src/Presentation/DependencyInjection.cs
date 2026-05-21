using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using ChatService.Presentation.Extensions;
using ChatService.Presentation.Hubs;

namespace ChatService.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddSwaggerServices();

        // Add SignalR and custom User ID Provider
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

        return services;
    }
}

