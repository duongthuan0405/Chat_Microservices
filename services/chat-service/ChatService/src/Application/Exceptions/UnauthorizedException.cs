using System.Collections.Generic;

namespace ChatService.Application.Exceptions;

public class UnauthorizedException : BusinessException
{
    public UnauthorizedException(string message) : base(message)
    {
    }

    public UnauthorizedException(string message, Dictionary<string, List<string>> errorsDetail) : base(message, errorsDetail)
    {
    }
}
