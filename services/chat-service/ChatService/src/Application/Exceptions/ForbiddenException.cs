using System.Collections.Generic;

namespace ChatService.Application.Exceptions;

public class ForbiddenException : BusinessException
{
    public ForbiddenException(string message) : base(message)
    {
    }

    public ForbiddenException(string message, Dictionary<string, List<string>> errorsDetail) : base(message, errorsDetail)
    {
    }
}
