using System;
using System.Collections.Generic;

namespace NotificationService.Presentation.Common;

public class ApiErrorResponse
{
    public bool Success { get; set; } = false;
    public string Message { get; set; } = null!;
    public Dictionary<string, List<string>>? Errors { get; set; }
    public ApiErrorResponse(string message, Dictionary<string, List<string>>? errors = null)
    {
        Message = message;
        Errors = errors;
    }
}
