using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System;

namespace ChatService.Presentation.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo 
            { 
                Title = "Chat Microservice API", 
                Version = "v1",
                Description = "API endpoints for Chat Microservice supporting real-time messaging."
            });

            // Add support for X-User-Id header inside Swagger UI
            c.AddSecurityDefinition("X-User-Id", new OpenApiSecurityScheme
            {
                Description = "Enter your User ID (Guid) to be sent in the X-User-Id header.",
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
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Chat Service API V1");
                c.RoutePrefix = "swagger";
            });
        }
        return app;
    }
}
