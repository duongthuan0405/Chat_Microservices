using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using NotificationService.Application.Persistence;

namespace NotificationService.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly NotificationDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task BeginAsync()
    {
        if (_transaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task FinishAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
            }
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            CleanUp();
        }
    }

    public async Task RollbackAsync()
    {
        if (_transaction != null)
        {
            try
            {
                await _transaction.RollbackAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UnitOfWork Error during Rollback]: {ex.Message}");
            }
            finally
            {
                CleanUp();
            }
        }
    }

    private void CleanUp()
    {
        if (_transaction != null)
        {
            _transaction.Dispose();
            _transaction = null;
        }
    }
}
