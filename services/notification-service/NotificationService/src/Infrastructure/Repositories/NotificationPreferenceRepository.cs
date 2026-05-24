using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Repositories;

public class NotificationPreferenceRepository : INotificationPreferenceRepository
{
    private readonly NotificationDbContext _context;

    public NotificationPreferenceRepository(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationPreference?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var model = await _context.Preferences
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        return model?.ToDomain();
    }

    public async Task<Guid> AddAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        var model = NotificationPreferenceModel.FromDomain(preference);
        await _context.Preferences.AddAsync(model, cancellationToken);
        return preference.Id;
    }

    public async Task<NotificationPreference> UpdateAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        var model = NotificationPreferenceModel.FromDomain(preference);

        var existing = await _context.Preferences.FindAsync(new object[] { model.Id }, cancellationToken);
        if (existing != null)
        {
            _context.Entry(existing).CurrentValues.SetValues(model);
        }
        else
        {
            _context.Preferences.Update(model);
        }

        return preference;
    }
}
