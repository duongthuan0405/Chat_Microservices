using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Features.Preferences.Commands.UpdateUserPreference;

public class UpdateUserNotificationPreferenceCommand : IRequest<UpdateUserNotificationPreferenceCommandResponse>
{
    public Guid UserId { get; set; }
    public bool EnablePush { get; set; }
}

public class UpdateUserNotificationPreferenceCommandResponse
{
    public Guid UserId { get; set; }
    public bool EnablePush { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class UpdateUserNotificationPreferenceCommandHandler : IRequestHandler<UpdateUserNotificationPreferenceCommand, UpdateUserNotificationPreferenceCommandResponse>
{
    private readonly INotificationPreferenceRepository _preferenceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserNotificationPreferenceCommandHandler(
        INotificationPreferenceRepository preferenceRepository,
        IUnitOfWork unitOfWork)
    {
        _preferenceRepository = preferenceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateUserNotificationPreferenceCommandResponse> Handle(UpdateUserNotificationPreferenceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var preference = await _preferenceRepository.GetByUserIdAsync(request.UserId, cancellationToken);

            if (preference == null)
            {
                preference = new NotificationPreference.NotificationPreferenceBuilder()
                    .WithUserId(request.UserId)
                    .WithEnablePush(request.EnablePush)
                    .Build();

                await _preferenceRepository.AddAsync(preference, cancellationToken);
            }
            else
            {
                preference.EnablePush = request.EnablePush;
                preference.UpdatedAt = DateTimeOffset.UtcNow;
                await _preferenceRepository.UpdateAsync(preference, cancellationToken);
            }

            await _unitOfWork.FinishAsync();

            return new UpdateUserNotificationPreferenceCommandResponse
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
