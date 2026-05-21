using System.Collections.Generic;

namespace NotificationService.Application.Exceptions;

public class ForbiddenException : BusinessException
{
    public ForbiddenException(string message) : base(message)
    {
    }

    public ForbiddenException(string message, Dictionary<string, List<string>> errorsDetail) : base(message, errorsDetail)
    {
    }
}
