using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Enums;

namespace NotificationService.Application.Features.Notifications.Queries.GetNotificationHistoryByUserId;

public class GetNotificationHistoryByUserIdQuery : IRequest<List<GetNotificationHistoryByUserIdQueryResponse>>
{
    public Guid UserId { get; set; }
}

public class GetNotificationHistoryByUserIdQueryResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DeliveryStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}

public class GetNotificationHistoryByUserIdQueryHandler : IRequestHandler<GetNotificationHistoryByUserIdQuery, List<GetNotificationHistoryByUserIdQueryResponse>>
{
    private readonly INotificationHistoryRepository _historyRepository;

    public GetNotificationHistoryByUserIdQueryHandler(INotificationHistoryRepository historyRepository)
    {
        _historyRepository = historyRepository;
    }

    public async Task<List<GetNotificationHistoryByUserIdQueryResponse>> Handle(GetNotificationHistoryByUserIdQuery request, CancellationToken cancellationToken)
    {
        var list = await _historyRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        var response = new List<GetNotificationHistoryByUserIdQueryResponse>();

        foreach (var item in list)
        {
            response.Add(new GetNotificationHistoryByUserIdQueryResponse
            {
                Id = item.Id,
                UserId = item.UserId,
                Title = item.Title,
                Content = item.Content,
                IsRead = item.IsRead,
                Status = item.Status,
                ErrorMessage = item.ErrorMessage,
                RetryCount = item.RetryCount,
                CreatedAt = item.CreatedAt,
                SentAt = item.SentAt
            });
        }

        return response;
    }
}
