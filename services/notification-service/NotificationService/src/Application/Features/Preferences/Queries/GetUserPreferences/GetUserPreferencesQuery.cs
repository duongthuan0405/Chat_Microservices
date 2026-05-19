using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Features.Preferences.Queries.GetUserPreferences;

public class GetUserPreferencesQuery : IRequest<GetUserPreferencesQueryResponse>
{
    public Guid UserId { get; set; }
}

public class GetUserPreferencesQueryResponse
{
    public Guid UserId { get; set; }
    public bool EnablePush { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class GetUserPreferencesQueryHandler : IRequestHandler<GetUserPreferencesQuery, GetUserPreferencesQueryResponse>
{
    private readonly INotificationPreferenceRepository _preferenceRepository;

    public GetUserPreferencesQueryHandler(INotificationPreferenceRepository preferenceRepository)
    {
        _preferenceRepository = preferenceRepository;
    }

    public async Task<GetUserPreferencesQueryResponse> Handle(GetUserPreferencesQuery request, CancellationToken cancellationToken)
    {
        var preference = await _preferenceRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        
        if (preference == null)
        {
            // Create default preference using the builder
            preference = new NotificationPreference.NotificationPreferenceBuilder()
                .WithUserId(request.UserId)
                .WithEnablePush(true)
                .Build();

            await _preferenceRepository.AddAsync(preference, cancellationToken);
        }

        return new GetUserPreferencesQueryResponse
        {
            UserId = preference.UserId,
            EnablePush = preference.EnablePush,
            UpdatedAt = preference.UpdatedAt
        };
    }
}
