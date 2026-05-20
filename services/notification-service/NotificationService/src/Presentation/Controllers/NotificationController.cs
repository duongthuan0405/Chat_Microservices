using System;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Features.Notifications.Commands.MarkNotificationAsRead;
using NotificationService.Application.Features.Notifications.Queries.GetNotificationHistoryByUserId;
using NotificationService.Application.Common.Models;
using NotificationService.Presentation.Common;
using NotificationService.Presentation.DTOs;

namespace NotificationService.Presentation.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiSuccessResponse<PagedResult<NotificationHistoryResponseDto>>>> GetHistoryByUserIdAsync(
        [FromRoute] Guid userId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetNotificationHistoryByUserIdQuery 
        { 
            UserId = userId,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _sender.Send(query);

        var items = result.Items.Select(item => new NotificationHistoryResponseDto
        {
            Id = item.Id,
            UserId = item.UserId,
            Title = item.Title,
            Content = item.Content,
            IsRead = item.IsRead,
            Status = item.Status.ToString(),
            ErrorMessage = item.ErrorMessage,
            CreatedAt = item.CreatedAt,
            SentAt = item.SentAt
        }).ToList();

        var response = new PagedResult<NotificationHistoryResponseDto>(
            items,
            result.TotalCount,
            result.PageNumber,
            result.PageSize
        );

        return Ok(new ApiSuccessResponse<PagedResult<NotificationHistoryResponseDto>>(response, "User notification history retrieved successfully."));
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiSuccessResponse<NotificationHistoryResponseDto>>> MarkAsReadAsync(
        [FromRoute] Guid id)
    {
        var command = new MarkNotificationAsReadCommand { Id = id };
        var result = await _sender.Send(command);

        var response = new NotificationHistoryResponseDto
        {
            Id = result.Id,
            UserId = result.UserId,
            Title = result.Title,
            Content = result.Content,
            IsRead = result.IsRead,
            Status = result.Status.ToString(),
            ErrorMessage = "",
            CreatedAt = result.CreatedAt,
            SentAt = result.SentAt
        };

        return Ok(new ApiSuccessResponse<NotificationHistoryResponseDto>(response, "Notification marked as read successfully."));
    }
}
