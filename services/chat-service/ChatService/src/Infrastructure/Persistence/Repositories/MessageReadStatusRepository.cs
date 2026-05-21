using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ChatService.Domain.Entities;
using ChatService.Application.Persistence.Repositories;
using ChatService.Infrastructure.Persistence.Models;

namespace ChatService.Infrastructure.Persistence.Repositories;

public class MessageReadStatusRepository : IMessageReadStatusRepository
{
    private readonly ChatDbContext _context;

    public MessageReadStatusRepository(ChatDbContext context)
    {
        _context = context;
    }

    public async Task<MessageReadStatus?> GetByConversationAndUserAsync(
        Guid conversationId, 
        Guid userId, 
        CancellationToken cancellationToken = default)
    {
        var dbStatus = await _context.MessageReadStatuses
            .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.UserId == userId, cancellationToken);

        return dbStatus == null ? null : MapToDomain(dbStatus);
    }

    public async Task<List<MessageReadStatus>> GetByConversationAsync(
        Guid conversationId, 
        CancellationToken cancellationToken = default)
    {
        var dbStatuses = await _context.MessageReadStatuses
            .Where(x => x.ConversationId == conversationId)
            .ToListAsync(cancellationToken);

        return dbStatuses.Select(MapToDomain).ToList();
    }

    public async Task<List<MessageReadStatus>> GetByConversationsAndUserAsync(
        List<Guid> conversationIds, 
        Guid userId, 
        CancellationToken cancellationToken = default)
    {
        if (conversationIds == null || conversationIds.Count == 0)
        {
            return new List<MessageReadStatus>();
        }

        var dbStatuses = await _context.MessageReadStatuses
            .Where(x => conversationIds.Contains(x.ConversationId) && x.UserId == userId)
            .ToListAsync(cancellationToken);

        return dbStatuses.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(MessageReadStatus status, CancellationToken cancellationToken = default)
    {
        var dbStatus = MapToDb(status);
        await _context.MessageReadStatuses.AddAsync(dbStatus, cancellationToken);
    }

    public async Task UpdateAsync(MessageReadStatus status, CancellationToken cancellationToken = default)
    {
        var dbStatus = await _context.MessageReadStatuses
            .FindAsync(new object[] { status.Id }, cancellationToken);

        if (dbStatus != null)
        {
            dbStatus.LastReadAt = status.LastReadAt;

            _context.MessageReadStatuses.Update(dbStatus);
        }
    }

    private static MessageReadStatus MapToDomain(MessageReadStatusDb dbStatus)
    {
        return new MessageReadStatus.MessageReadStatusBuilder()
            .WithId(dbStatus.Id)
            .WithConversationId(dbStatus.ConversationId)
            .WithUserId(dbStatus.UserId)
            .WithLastReadAt(dbStatus.LastReadAt)
            .Build();
    }

    private static MessageReadStatusDb MapToDb(MessageReadStatus status)
    {
        return new MessageReadStatusDb
        {
            Id = status.Id,
            ConversationId = status.ConversationId,
            UserId = status.UserId,
            LastReadAt = status.LastReadAt
        };
    }
}
