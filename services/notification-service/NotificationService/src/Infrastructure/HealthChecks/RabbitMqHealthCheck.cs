using System;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace NotificationService.Infrastructure.HealthChecks;

public class RabbitMqHealthCheck : IHealthCheck
{
    private readonly IBusControl _busControl;

    public RabbitMqHealthCheck(IBusControl busControl)
    {
        _busControl = busControl;
    }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var health = _busControl.CheckHealth();
            if (health.Status == BusHealthStatus.Healthy)
            {
                return Task.FromResult(HealthCheckResult.Healthy("RabbitMQ bus connection is healthy."));
            }

            return Task.FromResult(HealthCheckResult.Unhealthy($"RabbitMQ bus is unhealthy: {health.Description}"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("RabbitMQ health check failed.", ex));
        }
    }
}
