using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ChatService.Domain.Entities;

namespace ChatService.Application.Persistence.Repositories;

public interface IMessageRepository
{
    Task<Message?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<List<Message>> GetPagedByConversationIdAsync(
        Guid conversationId, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default);

    Task<Message?> GetLatestBeforeAsync(
        Guid conversationId, 
        DateTimeOffset beforeTime, 
        CancellationToken cancellationToken = default);

    Task AddAsync(Message message, CancellationToken cancellationToken = default);

    Task UpdateAsync(Message message, CancellationToken cancellationToken = default);
}
