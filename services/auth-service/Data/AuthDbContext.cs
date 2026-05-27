using Microsoft.EntityFrameworkCore;
using AuthService.Models;

namespace AuthService.Data;

public sealed class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    public DbSet<UserAccount> Users { get; set; } = null!;

}
