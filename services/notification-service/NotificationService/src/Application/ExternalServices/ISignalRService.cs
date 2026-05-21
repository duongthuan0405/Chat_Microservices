using System;
using System.Threading;
using System.Threading.Tasks;

namespace NotificationService.Application.ExternalServices;

public interface ISignalRService
{
    Task SendToUserAsync(Guid userId, string method, object payload, CancellationToken cancellationToken = default);
}
