using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ChatService.Application.ExternalServices;

public interface IConversationServiceClient
{
    Task<bool> IsMemberAsync(Guid conversationId, Guid userId, CancellationToken cancellationToken = default);
    Task<List<Guid>> GetMemberIdsAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
