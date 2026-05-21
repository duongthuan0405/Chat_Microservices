using System;
using System.Threading;
using System.Threading.Tasks;
using ChatService.Application.ExternalServices;

namespace ChatService.Infrastructure.ExternalServices;

public class ConversationServiceClient : IConversationServiceClient
{
    public Task<bool> IsMemberAsync(Guid conversationId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Placeholder implementation: always allow for development/testing.
        // Will be replaced with actual call to group-service.
        return Task.FromResult(true);
    }
}
