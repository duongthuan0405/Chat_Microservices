using System;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Presentation.Hubs;

namespace NotificationService.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services)
    {
        // Register SignalR & gateway integration services with custom Heartbeat (KeepAlive) configuration
        services.AddSignalR(options =>
        {
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
        });
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

        return services;
    }
}
