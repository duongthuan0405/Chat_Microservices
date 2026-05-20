using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Repositories;

public class NotificationHistoryRepository : INotificationHistoryRepository
{
    private readonly NotificationDbContext _context;

    public NotificationHistoryRepository(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var model = await _context.Histories
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return model?.ToDomain();
    }

    public async Task<List<NotificationHistory>> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var models = await _context.Histories
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return models.Select(x => x.ToDomain()).ToList();
    }

    public async Task AddAsync(NotificationHistory history, CancellationToken cancellationToken = default)
    {
        var model = NotificationHistoryModel.FromDomain(history);
        await _context.Histories.AddAsync(model, cancellationToken);
    }

    public async Task UpdateAsync(NotificationHistory history, CancellationToken cancellationToken = default)
    {
        var model = NotificationHistoryModel.FromDomain(history);

        var existing = await _context.Histories.FindAsync(new object[] { model.Id }, cancellationToken);
        if (existing != null)
        {
            _context.Entry(existing).CurrentValues.SetValues(model);
        }
        else
        {
            _context.Histories.Update(model);
        }
    }
}
