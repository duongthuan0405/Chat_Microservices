using System.Collections.Generic;
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

    public Task<List<Guid>> GetMemberIdsAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        // Placeholder implementation: returns mock list of users who belong to the conversation.
        // In real environment, this will call the group-service API.
        var mockMembers = new List<Guid>
        {
            Guid.Parse("3fa85f64-5717-4562-b3fc-2c963f66afa6"), // Swagger default User 1
            Guid.Parse("7fa85f64-5717-4562-b3fc-2c963f66afb7")  // Swagger default User 2
        };
        return Task.FromResult(mockMembers);
    }
}
