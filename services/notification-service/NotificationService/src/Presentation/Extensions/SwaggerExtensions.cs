using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System;

namespace NotificationService.Presentation.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Notification Service API", Version = "v1" });

            // Add X-User-Id header input in Swagger UI
            c.AddSecurityDefinition("X-User-Id", new OpenApiSecurityScheme
            {
                Description = "Enter your User ID (Guid). Example: 3fa85f64-5717-4562-b3fc-2c963f66afa6",
                In = ParameterLocation.Header,
                Name = "X-User-Id",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "X-User-Id"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "X-User-Id"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
        return services;
    }

    public static IApplicationBuilder UseSwaggerServices(this IApplicationBuilder app, IHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Notification Service API V1");
                c.RoutePrefix = "swagger";
            });
        }
        return app;
    }
}
