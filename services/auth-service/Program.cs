using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using AuthService.Data;
using AuthService;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddDbContext<AuthService.Data.AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection") ?? builder.Configuration["ConnectionStrings:DefaultConnection"]));
builder.Services.AddScoped<AuthenticationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapPost("/auth/register", async (AuthenticationService authService, RegisterRequest request) =>
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

app.MapPost("/auth/login", async (AuthenticationService authService, LoginRequest request) =>
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

app.MapPost("/auth/decode", (AuthenticationService authService, DecodeTokenRequest request) =>
{
    try
    {
        return Results.Ok(authService.DecodeToken(request.Token));
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (SecurityTokenException)
    {
        return Results.Unauthorized();
    }
})
.WithName("DecodeToken");

app.MapGet("/profile/{userId}", async (AuthenticationService authService, string userId) =>
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

app.MapPut("/profile/{userId}", async (AuthenticationService authService, string userId, UpdateProfileRequest request) =>
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

// Ensure database is created/migrated on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AuthService.Data.AuthDbContext>();
    db.Database.Migrate();
}

app.Run();

public sealed record DecodeTokenRequest(string Token);
