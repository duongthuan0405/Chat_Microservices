using MediatR;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Features.Notifications.Commands.MarkNotificationAsRead;
using NotificationService.Application.Features.Notifications.Queries.GetNotificationHistoryByUserId;
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
    public async Task<ActionResult<ApiSuccessResponse<List<NotificationHistoryResponseDto>>>> GetHistoryByUserIdAsync(
        [FromRoute] Guid userId)
    {
        var query = new GetNotificationHistoryByUserIdQuery { UserId = userId };
        var result = await _sender.Send(query);

        var response = new List<NotificationHistoryResponseDto>();
        foreach (var item in result)
        {
            response.Add(new NotificationHistoryResponseDto
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
            });
        }

        return Ok(new ApiSuccessResponse<List<NotificationHistoryResponseDto>>(response, "User notification history retrieved successfully."));
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
