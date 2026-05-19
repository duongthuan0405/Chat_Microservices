using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Features.Preferences.Commands.ToggleUserPreference;
using NotificationService.Application.Features.Preferences.Queries.GetUserPreferences;
using NotificationService.Presentation.Common;
using NotificationService.Presentation.DTOs;

namespace NotificationService.Presentation.Controllers;

[ApiController]
[Route("api/preferences")]
public class NotificationPreferenceController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationPreferenceController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<ApiSuccessResponse<NotificationPreferenceResponseDto>>> GetPreferencesAsync(
        [FromRoute] Guid userId)
    {
        var query = new GetUserPreferencesQuery { UserId = userId };
        var result = await _sender.Send(query);

        var response = new NotificationPreferenceResponseDto
        {
            UserId = result.UserId,
            EnablePush = result.EnablePush,
            UpdatedAt = result.UpdatedAt
        };

        return Ok(new ApiSuccessResponse<NotificationPreferenceResponseDto>(response, "User notification preferences retrieved successfully."));
    }

    [HttpPost("{userId:guid}/toggle")]
    public async Task<ActionResult<ApiSuccessResponse<NotificationPreferenceResponseDto>>> TogglePreferencesAsync(
        [FromRoute] Guid userId)
    {
        var command = new ToggleUserNotificationPreferenceCommand { UserId = userId };
        var result = await _sender.Send(command);

        var response = new NotificationPreferenceResponseDto
        {
            UserId = result.UserId,
            EnablePush = result.EnablePush,
            UpdatedAt = result.UpdatedAt
        };

        return Ok(new ApiSuccessResponse<NotificationPreferenceResponseDto>(response, "User notification preferences toggled successfully."));
    }
}
