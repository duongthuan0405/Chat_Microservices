using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using ChatService.Application.Persistence;

namespace ChatService.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly ChatDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(ChatDbContext context)
    {
        _context = context;
    }

    public async Task BeginAsync()
    {
        if (_transaction == null)
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }
    }

    public async Task FinishAsync()
    {
        await _context.SaveChangesAsync();

        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }
}
