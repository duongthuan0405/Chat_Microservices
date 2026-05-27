using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using AuthService.Data;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService;

public sealed class JwtSettings
{
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string SigningKey { get; init; } = string.Empty;
}

public sealed record RegisterRequest(string Email, string Password);

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResult(string Id, string Email, string Token, DateTime ExpiresAt);

public sealed record TokenClaims(string Id, string Email, string Token, DateTime ExpiresAt);

public sealed record UpdateProfileRequest(string Name, string PhoneNumber, string AvatarUrl, string Gender);

public sealed record UserProfileResponse(string Id, string Email, string Name, string PhoneNumber, string AvatarUrl, DateTime CreatedAt, DateTime UpdatedAt, string Gender);

public sealed class AuthenticationService
{
    private readonly JwtSettings settings;
    private readonly PasswordHasher<UserAccount> passwordHasher = new();
    private readonly AuthDbContext db;

    public AuthenticationService(IOptions<JwtSettings> jwtOptions, AuthDbContext db)
    {
        settings = jwtOptions.Value;
        this.db = db;
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
    {
        ValidateCredentials(request.Email, request.Password);

        var email = NormalizeEmail(request.Email);

        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var now = DateTime.UtcNow;
        var account = new UserAccount
        {
            Id = Guid.NewGuid().ToString(),
            Email = email,
            Name = string.Empty,
            PhoneNumber = string.Empty,
            AvatarUrl = string.Empty,
            CreatedAt = now,
            UpdatedAt = now,
            Gender = string.Empty,
        };

        account.PasswordHash = passwordHasher.HashPassword(null!, request.Password);
        db.Users.Add(account);
        await db.SaveChangesAsync();

        return CreateAuthResult(account);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        ValidateCredentials(request.Email, request.Password);

        var email = NormalizeEmail(request.Email);

        var account = await db.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (account is null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var verification = passwordHasher.VerifyHashedPassword(null!, account.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return CreateAuthResult(account);
    }

    public TokenClaims DecodeToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var principal = handler.ValidateToken(token, CreateValidationParameters(), out var validatedToken);

        if (validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token algorithm.");
        }

        return new TokenClaims(
            GetRequiredClaim(principal, ClaimTypes.NameIdentifier),
            GetRequiredClaim(principal, ClaimTypes.Email),
            token,
            jwtToken.ValidTo
        );
    }

    public async Task<UserProfileResponse> GetProfileAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID is required.");
        }

        var account = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (account is null)
        {
            throw new KeyNotFoundException($"User with ID '{userId}' not found.");
        }

        return MapToProfileResponse(account);
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID is required.");
        }

        var account = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (account is null)
        {
            throw new KeyNotFoundException($"User with ID '{userId}' not found.");
        }

        account.Name = request.Name ?? account.Name;
        account.PhoneNumber = request.PhoneNumber ?? account.PhoneNumber;
        account.AvatarUrl = request.AvatarUrl ?? account.AvatarUrl;
        account.Gender = request.Gender ?? account.Gender;
        account.UpdatedAt = DateTime.UtcNow;

        db.Users.Update(account);
        await db.SaveChangesAsync();

        return MapToProfileResponse(account);
    }

    private UserProfileResponse MapToProfileResponse(UserAccount account)
    {
        return new UserProfileResponse(
            account.Id,
            account.Email,
            account.Name,
            account.PhoneNumber,
            account.AvatarUrl,
            account.CreatedAt,
            account.UpdatedAt,
            account.Gender
        );
    }

    private AuthResult CreateAuthResult(UserAccount account)
    {
        var expiresAt = DateTime.UtcNow.AddDays(3);
        var token = CreateToken(account, expiresAt);

        return new AuthResult(
            account.Id,
            account.Email,
            token,
            expiresAt
        );
    }

    private string CreateToken(UserAccount account, DateTime expiresAt)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SigningKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new(ClaimTypes.Email, account.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Sub, account.Email),
        };

        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private TokenValidationParameters CreateValidationParameters()
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = settings.Issuer,
            ValidateAudience = true,
            ValidAudience = settings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };
    }

    private static string GetRequiredClaim(ClaimsPrincipal principal, string claimType)
    {
        return principal.FindFirstValue(claimType)
            ?? throw new SecurityTokenException($"Missing required claim '{claimType}'.");
    }

    private static void ValidateCredentials(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password is required.");
        }
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim();
    }
}
