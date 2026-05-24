using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ChatService.Domain.Entities;
using ChatService.Application.Common.Models;
using ChatService.Application.Persistence.Repositories;
using ChatService.Infrastructure.Persistence.Models;

namespace ChatService.Infrastructure.Persistence.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly ChatDbContext _context;

    public MessageRepository(ChatDbContext context)
    {
        _context = context;
    }

    public async Task<Message?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var dbMessage = await _context.Messages
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return dbMessage == null ? null : MapToDomain(dbMessage);
    }

    public async Task<PagedResult<Message>> GetPagedByConversationIdAsync(
        Guid conversationId, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.Messages
            .Where(x => x.ConversationId == conversationId && !x.IsDeleted);

        var totalCount = await query.CountAsync(cancellationToken);

        var dbMessages = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = dbMessages.Select(MapToDomain).ToList();

        return new PagedResult<Message>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<Message?> GetLatestBeforeAsync(
        Guid conversationId, 
        DateTimeOffset beforeTime, 
        CancellationToken cancellationToken = default)
    {
        var dbMessage = await _context.Messages
            .Where(x => x.ConversationId == conversationId && x.CreatedAt < beforeTime && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return dbMessage == null ? null : MapToDomain(dbMessage);
    }

    public async Task<Dictionary<Guid, Message>> GetLatestMessagesAsync(
        List<Guid> conversationIds, 
        CancellationToken cancellationToken = default)
    {
        if (conversationIds == null || conversationIds.Count == 0)
        {
            return new Dictionary<Guid, Message>();
        }

        var latestDbMessages = await _context.Messages
            .Where(x => conversationIds.Contains(x.ConversationId) && !x.IsDeleted)
            .Where(x => x.Id == _context.Messages
                .Where(m => m.ConversationId == x.ConversationId && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => m.Id)
                .FirstOrDefault())
            .ToListAsync(cancellationToken);

        return latestDbMessages
            .Select(x => MapToDomain(x))
            .ToDictionary(x => x.ConversationId, x => x);
    }

    public async Task AddAsync(Message message, CancellationToken cancellationToken = default)
    {
        var dbMessage = MapToDb(message);
        await _context.Messages.AddAsync(dbMessage, cancellationToken);
    }

    public async Task UpdateAsync(Message message, CancellationToken cancellationToken = default)
    {
        var dbMessage = await _context.Messages
            .FindAsync(new object[] { message.Id }, cancellationToken);

        if (dbMessage != null)
        {
            dbMessage.Content = message.Content;
            dbMessage.Type = message.Type;
            dbMessage.IsDeleted = message.IsDeleted;
            dbMessage.UpdatedAt = message.UpdatedAt;

            _context.Messages.Update(dbMessage);
        }
    }

    private static Message MapToDomain(MessageDb dbMessage)
    {
        return new Message.MessageBuilder()
            .WithId(dbMessage.Id)
            .WithConversationId(dbMessage.ConversationId)
            .WithSenderId(dbMessage.SenderId)
            .WithContent(dbMessage.Content)
            .WithType(dbMessage.Type)
            .WithIsDeleted(dbMessage.IsDeleted)
            .WithCreatedAt(dbMessage.CreatedAt)
            .WithUpdatedAt(dbMessage.UpdatedAt)
            .Build();
    }

    private static MessageDb MapToDb(Message message)
    {
        return new MessageDb
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            Content = message.Content,
            Type = message.Type,
            IsDeleted = message.IsDeleted,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt
        };
    }
}
