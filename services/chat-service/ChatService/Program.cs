using ChatService.Application;
using ChatService.Infrastructure;
using ChatService.Presentation;
using ChatService.Presentation.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ChatService;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddAuthorization();
        builder.Services.AddControllers();
        builder.Services.AddOpenApi();

        builder.Services.AddApplicationServices();
        builder.Services.AddInfrastructureServices(builder.Configuration);
        builder.Services.AddPresentationServices();
        builder.Services.AddMiddlewares();

        var app = builder.Build();

        // Configure Middleware Pipeline
        app.UseMiddlewarePipeline();

        app.MapControllers();

        app.MapGet("/test", (HttpContext httpContext) =>
        {
            return "Hello World! I am Chat Service.";
        })
        .WithName("GetTest");

        app.Run();
    }
}

