using System;
using System.Threading;
using System.Threading.Tasks;
using ChatService.Domain.Entities;

namespace ChatService.Application.Persistence.Repositories;

public interface IMessageReadStatusRepository
{
    Task<MessageReadStatus?> GetByConversationAndUserAsync(
        Guid conversationId, 
        Guid userId, 
        CancellationToken cancellationToken = default);

    Task<List<MessageReadStatus>> GetByLastReadMessageIdAsync(
        Guid lastReadMessageId, 
        CancellationToken cancellationToken = default);

    Task AddAsync(MessageReadStatus status, CancellationToken cancellationToken = default);

    Task UpdateAsync(MessageReadStatus status, CancellationToken cancellationToken = default);
}
