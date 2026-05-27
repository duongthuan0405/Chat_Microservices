using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Features.Preferences.Commands.ToggleUserPreference;

public class ToggleUserNotificationPreferenceCommand : IRequest<ToggleUserNotificationPreferenceCommandResponse>
{
    public Guid UserId { get; set; }
}

public class ToggleUserNotificationPreferenceCommandResponse
{
    public Guid UserId { get; set; }
    public bool EnablePush { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class ToggleUserNotificationPreferenceCommandHandler : IRequestHandler<ToggleUserNotificationPreferenceCommand, ToggleUserNotificationPreferenceCommandResponse>
{
    private readonly INotificationPreferenceRepository _preferenceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleUserNotificationPreferenceCommandHandler(
        INotificationPreferenceRepository preferenceRepository,
        IUnitOfWork unitOfWork)
    {
        _preferenceRepository = preferenceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ToggleUserNotificationPreferenceCommandResponse> Handle(ToggleUserNotificationPreferenceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var preference = await _preferenceRepository.GetByUserIdAsync(request.UserId, cancellationToken);

            if (preference == null)
            {
                // Default is EnablePush = true, so toggling it sets it to FALSE
                preference = new NotificationPreference.NotificationPreferenceBuilder()
                    .WithUserId(request.UserId)
                    .WithEnablePush(false)
                    .Build();

                await _preferenceRepository.AddAsync(preference, cancellationToken);
            }
            else
            {
                // Invert the existing EnablePush value
                preference.EnablePush = !preference.EnablePush;
                preference.UpdatedAt = DateTimeOffset.UtcNow;
                await _preferenceRepository.UpdateAsync(preference, cancellationToken);
            }

            await _unitOfWork.FinishAsync();

            return new ToggleUserNotificationPreferenceCommandResponse
            {
                UserId = preference.UserId,
                EnablePush = preference.EnablePush,
                UpdatedAt = preference.UpdatedAt
            };
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
