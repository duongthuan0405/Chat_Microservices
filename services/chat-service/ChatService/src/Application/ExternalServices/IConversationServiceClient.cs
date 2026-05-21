using System;
using System.Threading;
using System.Threading.Tasks;

namespace ChatService.Application.ExternalServices;

public interface IConversationServiceClient
{
    Task<bool> IsMemberAsync(Guid conversationId, Guid userId, CancellationToken cancellationToken = default);
}
