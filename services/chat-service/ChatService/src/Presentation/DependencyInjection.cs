using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using ChatService.Presentation.Extensions;
using ChatService.Presentation.Hubs;

namespace ChatService.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
        services.AddSwaggerServices();

        // Add SignalR and custom User ID Provider
        services.AddSignalR()
            .AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

        return services;
    }
}

