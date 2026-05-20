using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Persistence.Repositories;

public interface INotificationHistoryRepository
{
    Task<NotificationHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<NotificationHistory>> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task AddAsync(NotificationHistory history, CancellationToken cancellationToken = default);
    Task UpdateAsync(NotificationHistory history, CancellationToken cancellationToken = default);
}
