using System.Collections.Generic;

namespace ChatService.Application.Exceptions;

public class ConflictException : BusinessException
{
    public ConflictException(string message) : base(message)
    {
    }

    public ConflictException(string message, Dictionary<string, List<string>> errorsDetail) : base(message, errorsDetail)
    {
    }
}
