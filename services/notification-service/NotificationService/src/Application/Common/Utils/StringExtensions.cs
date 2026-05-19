using System.Collections.Generic;

namespace NotificationService.Application.Common.Utils;

public static class StringExtensions
{
    public static string Render(this string template, Dictionary<string, string> parameters)
    {
        if (string.IsNullOrWhiteSpace(template) || parameters == null)
            return template;

        string result = template;
        foreach (var param in parameters)
        {
            result = result
                .Replace($"{{{param.Key}}}", param.Value)
                .Replace($"{{{{{param.Key}}}}}", param.Value);
        }
        return result;
    }
}
