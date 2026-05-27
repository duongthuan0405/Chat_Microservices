using System.ComponentModel.DataAnnotations;

namespace AuthService.Models;

public sealed class UserAccount
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string AvatarUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}

