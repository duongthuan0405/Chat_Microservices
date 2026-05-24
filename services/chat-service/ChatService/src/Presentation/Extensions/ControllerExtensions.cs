using System;
using Microsoft.AspNetCore.Mvc;
using ChatService.Application.Exceptions;

namespace ChatService.Presentation.Extensions;

public static class ControllerExtensions
{
    public static Guid GetCurrentUserId(this ControllerBase controller)
    {
        if (controller.Request.Headers.TryGetValue("X-User-Id", out var userIdStr) && Guid.TryParse(userIdStr, out var userId))
        {
            return userId;
        }

        if (controller.Request.Query.TryGetValue("userId", out var queryUserIdStr) && Guid.TryParse(queryUserIdStr, out var queryUserId))
        {
            return queryUserId;
        }

        throw new UnauthorizedException("User ID is missing or invalid.");
    }
}
