using Microsoft.AspNetCore.SignalR;
using System;

namespace NotificationService.Presentation.Hubs;

public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var httpContext = connection.GetHttpContext();
        if (httpContext == null) return null;

        // 1. Try reading the X-User-Id header (passed by API Gateway)
        if (httpContext.Request.Headers.TryGetValue("X-User-Id", out var gatewayUserId))
        {
            var idStr = gatewayUserId.ToString();
            if (!string.IsNullOrWhiteSpace(idStr))
            {
                return idStr;
            }
        }

        // 2. Fallback to reading the "userId" parameter from the Query String (for local testing)
        if (httpContext.Request.Query.TryGetValue("userId", out var queryUserId))
        {
            var idStr = queryUserId.ToString();
            if (!string.IsNullOrWhiteSpace(idStr))
            {
                return idStr;
            }
        }

        return null;
    }
}
