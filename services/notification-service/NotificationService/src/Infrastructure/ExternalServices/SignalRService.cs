using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.ExternalServices;
using NotificationService.Infrastructure.Hubs;

namespace NotificationService.Infrastructure.ExternalServices;

public class SignalRService : ISignalRService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendToUserAsync(Guid userId, string method, object payload, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync(method, payload, cancellationToken);
    }
}
