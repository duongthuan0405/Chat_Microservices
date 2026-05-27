using System.Threading;
using System.Threading.Tasks;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Persistence.Repositories;

public interface INotificationTemplateRepository
{
    Task<NotificationTemplate?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task AddAsync(NotificationTemplate template, CancellationToken cancellationToken = default);
    Task UpdateAsync(NotificationTemplate template, CancellationToken cancellationToken = default);
}
