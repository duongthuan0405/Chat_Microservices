using System;
using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace NotificationService.Presentation.Consumers.Filters;

public class LoggingConsumeFilter<T> : IFilter<ConsumeContext<T>> where T : class
{
    private readonly ILogger<LoggingConsumeFilter<T>> _logger;

    public LoggingConsumeFilter(ILogger<LoggingConsumeFilter<T>> logger)
    {
        _logger = logger;
    }

    public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
    {
        var messageName = typeof(T).Name;
        _logger.LogInformation("--> MassTransit: Received integration event '{MessageName}'", messageName);

        try
        {
            await next.Send(context);
            _logger.LogInformation("<-- MassTransit: Successfully processed integration event '{MessageName}'", messageName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[!] MassTransit: Failed to process integration event '{MessageName}'. Error: {ErrorMessage}", messageName, ex.Message);
            throw; // Tiếp tục throw để MassTransit tự động đẩy vào _error queue hoặc thực hiện Retry
        }
    }

    public void Probe(ProbeContext context)
    {
        context.CreateFilterScope("logging-consume-filter");
    }
}
