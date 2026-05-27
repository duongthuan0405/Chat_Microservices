using System.Collections.Generic;

namespace NotificationService.Application.Exceptions;

public class BadRequestException : BusinessException
{
    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, Dictionary<string, List<string>> errorsDetail) : base(message, errorsDetail)
    {
    }
}
