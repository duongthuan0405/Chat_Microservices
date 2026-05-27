using System.Collections.Generic;

namespace NotificationService.Application.Exceptions;

public class UnauthorizedException : BusinessException
{
    public UnauthorizedException() : base("Unauthorized access.")
    {
    }

    public UnauthorizedException(string message) : base(message)
    {
    }

    public UnauthorizedException(string message, Dictionary<string, List<string>> errorsDetail) : base(message, errorsDetail)
    {
    }
}
