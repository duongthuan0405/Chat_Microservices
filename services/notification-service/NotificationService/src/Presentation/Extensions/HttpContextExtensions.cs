using System;
using Microsoft.AspNetCore.Http;
using NotificationService.Application.Exceptions;

namespace NotificationService.Presentation.Extensions;

public static class HttpContextExtensions
{
    public static Guid GetCurrentUserId(this HttpContext httpContext)
    {
        // 1. Try reading the X-User-Id header (passed by API Gateway)
        if (httpContext.Request.Headers.TryGetValue("X-User-Id", out var userIdHeader))
        {
            var idStr = userIdHeader.ToString();
            if (!string.IsNullOrWhiteSpace(idStr) && Guid.TryParse(idStr, out var userId))
            {
                return userId;
            }
        }

        // 2. Fallback to reading the "userId" parameter from the Query String (for local testing)
        if (httpContext.Request.Query.TryGetValue("userId", out var queryUserId))
        {
            var idStr = queryUserId.ToString();
            if (!string.IsNullOrWhiteSpace(idStr) && Guid.TryParse(idStr, out var userId))
            {
                return userId;
            }
        }

        throw new UnauthorizedException("User context is missing or invalid. Make sure the X-User-Id header is present.");
    }
}
