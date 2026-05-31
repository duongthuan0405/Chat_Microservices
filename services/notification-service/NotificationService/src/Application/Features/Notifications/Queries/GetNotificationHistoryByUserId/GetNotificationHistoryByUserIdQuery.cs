using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Common.Models;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Enums;

namespace NotificationService.Application.Features.Notifications.Queries.GetNotificationHistoryByUserId;

public class GetNotificationHistoryByUserIdQuery : IRequest<PagedResult<GetNotificationHistoryByUserIdQueryResponse>>
{
    public Guid UserId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetNotificationHistoryByUserIdQueryResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string NotificationType { get; set; } = null!;
    public Guid? RefTo { get; set; }
    public bool IsRead { get; set; }
    public DeliveryStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}

public class GetNotificationHistoryByUserIdQueryHandler : IRequestHandler<GetNotificationHistoryByUserIdQuery, PagedResult<GetNotificationHistoryByUserIdQueryResponse>>
{
    private readonly INotificationHistoryRepository _historyRepository;

    public GetNotificationHistoryByUserIdQueryHandler(INotificationHistoryRepository historyRepository)
    {
        _historyRepository = historyRepository;
    }

    public async Task<PagedResult<GetNotificationHistoryByUserIdQueryResponse>> Handle(GetNotificationHistoryByUserIdQuery request, CancellationToken cancellationToken)
    {
        var pagedResult = await _historyRepository.GetByUserIdAsync(request.UserId, request.PageNumber, request.PageSize, cancellationToken);
        var responseItems = new List<GetNotificationHistoryByUserIdQueryResponse>();

        foreach (var item in pagedResult.Items)
        {
            responseItems.Add(new GetNotificationHistoryByUserIdQueryResponse
            {
                Id = item.Id,
                UserId = item.UserId,
                Title = item.Title,
                Content = item.Content,
                NotificationType = item.NotificationType,
                RefTo = item.RefTo,
                IsRead = item.IsRead,
                Status = item.Status,
                ErrorMessage = item.ErrorMessage,
                RetryCount = item.RetryCount,
                CreatedAt = item.CreatedAt,
                SentAt = item.SentAt
            });
        }

        return new PagedResult<GetNotificationHistoryByUserIdQueryResponse>(
            responseItems,
            pagedResult.TotalCount,
            pagedResult.PageNumber,
            pagedResult.PageSize
        );
    }
}
