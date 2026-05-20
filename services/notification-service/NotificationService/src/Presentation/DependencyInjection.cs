using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Presentation.Hubs;

namespace NotificationService.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services)
    {
        // Register SignalR & gateway integration services in the Presentation layer
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

        return services;
    }
}
