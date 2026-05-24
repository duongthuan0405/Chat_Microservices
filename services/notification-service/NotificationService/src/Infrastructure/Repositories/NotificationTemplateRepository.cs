using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Persistence.Models;

namespace NotificationService.Infrastructure.Repositories;

public class NotificationTemplateRepository : INotificationTemplateRepository
{
    private readonly NotificationDbContext _context;

    public NotificationTemplateRepository(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationTemplate?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var model = await _context.Templates
            .FirstOrDefaultAsync(x => x.Code == code, cancellationToken);
        return model?.ToDomain();
    }

    public async Task AddAsync(NotificationTemplate template, CancellationToken cancellationToken = default)
    {
        var model = NotificationTemplateModel.FromDomain(template);
        await _context.Templates.AddAsync(model, cancellationToken);
    }

    public async Task UpdateAsync(NotificationTemplate template, CancellationToken cancellationToken = default)
    {
        var model = NotificationTemplateModel.FromDomain(template);

        var existing = await _context.Templates.FindAsync(new object[] { model.Id }, cancellationToken);
        if (existing != null)
        {
            _context.Entry(existing).CurrentValues.SetValues(model);
        }
        else
        {
            _context.Templates.Update(model);
        }
    }
}
