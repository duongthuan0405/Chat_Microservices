using System;
using System.Collections.Generic;

namespace NotificationService.Application.Exceptions;

public abstract class BusinessException : Exception
{
    public Dictionary<string, List<string>> ErrorsDetail { get; }

    protected BusinessException(string message) : base(message)
    {
        ErrorsDetail = new Dictionary<string, List<string>>();
    }

    protected BusinessException(string message, Dictionary<string, List<string>> errorsDetail) : base(message)
    {
        ErrorsDetail = errorsDetail ?? new Dictionary<string, List<string>>();
    }
}
