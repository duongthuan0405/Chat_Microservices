using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http;
using AuthService.Data;
using AuthService;
using Prometheus;

// before CreateBuilder: load .env and ensure DEFAULT_CONNECTION_STRING exists
DotNetEnv.Env.Load(); // loads .env into environment variables
var defaultConnection = Environment.GetEnvironmentVariable("DEFAULT_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(defaultConnection))
{
    throw new InvalidOperationException("DEFAULT_CONNECTION_STRING was not found in .env or environment variables. Aborting startup.");
}

var builder = WebApplication.CreateBuilder(args);
// map DEFAULT_CONNECTION_STRING -> ConnectionStrings:DefaultConnection
builder.Configuration["ConnectionStrings:DefaultConnection"] = defaultConnection;

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddDbContext<AuthService.Data.AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection") ?? builder.Configuration["ConnectionStrings:DefaultConnection"]));
builder.Services.AddScoped<AuthenticationService>();

var app = builder.Build();
app.UseHttpMetrics(options =>
{
    options.AddCustomLabel("service", _ => "auth-service");
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        success = true,
        message = "auth-service is running"
    });
})
.WithName("Health");

// app.UseHttpsRedirection();

app.MapPost("/api/auth/register", async (AuthenticationService authService, RegisterRequest request) =>
{
    try
    {
        return Results.Ok(await authService.RegisterAsync(request));
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }
})
.WithName("Register");

app.MapPost("/api/auth/login", async (AuthenticationService authService, LoginRequest request) =>
{
    try
    {
        return Results.Ok(await authService.LoginAsync(request));
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (UnauthorizedAccessException)
    {
        return Results.Unauthorized();
    }
})
.WithName("Login");

app.MapGet("/api/auth/verify-token", (AuthenticationService authService, HttpRequest httpRequest, HttpResponse httpResponse) =>
{
    try
    {
        if (!httpRequest.Headers.TryGetValue("Authorization", out var authHeader))
            return Results.Unauthorized();

        var header = authHeader.ToString();
        const string bearer = "Bearer ";
        if (!header.StartsWith(bearer, StringComparison.OrdinalIgnoreCase))
            return Results.Unauthorized();

        var token = header[bearer.Length..].Trim();
        var claims = authService.DecodeToken(token);

        httpResponse.Headers["X-User-Id"] = claims.Id;
        httpResponse.Headers["X-User-Email"] = claims.Email;

        return Results.Empty;
    }
    catch (ArgumentException)
    {
        return Results.Unauthorized();
    }
    catch (SecurityTokenException)
    {
        return Results.Unauthorized();
    }
})
.WithName("VerifyToken");

app.MapGet("/api/profile/{userId}", async (AuthenticationService authService, string userId) =>
{
    try
    {
        return Results.Ok(await authService.GetProfileAsync(userId));
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (KeyNotFoundException exception)
    {
        return Results.NotFound(new { message = exception.Message });
    }
})
.WithName("GetProfile");

app.MapPut("/api/profile/{userId}", async (AuthenticationService authService, string userId, UpdateProfileRequest request) =>
{
    try
    {
        return Results.Ok(await authService.UpdateProfileAsync(userId, request));
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (KeyNotFoundException exception)
    {
        return Results.NotFound(new { message = exception.Message });
    }
})
.WithName("UpdateProfile");

app.MapGet("/api/users/search", async (AuthenticationService authService, string query) =>
{
    try
    {
        return Results.Ok(await authService.SearchUsersAsync(query));
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
}).WithName("SearchUsers");

// Ensure database is created/migrated on startup only when requested
if (args != null && args.Contains("--migrate"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AuthService.Data.AuthDbContext>();
    db.Database.Migrate();
}
app.MapMetrics();
app.Run();

public sealed record DecodeTokenRequest(string Token);
