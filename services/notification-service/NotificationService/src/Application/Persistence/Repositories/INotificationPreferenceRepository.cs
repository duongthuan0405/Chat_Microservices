using System;
using System.Threading;
using System.Threading.Tasks;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Persistence.Repositories;

public interface INotificationPreferenceRepository
{
    Task<NotificationPreference?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Guid> AddAsync(NotificationPreference preference, CancellationToken cancellationToken = default);
    Task<NotificationPreference> UpdateAsync(NotificationPreference preference, CancellationToken cancellationToken = default);
}
