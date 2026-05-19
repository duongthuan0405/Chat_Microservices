using FluentValidation;

namespace NotificationService.Application.Features.Preferences.Commands.ToggleUserPreference;

public class ToggleUserNotificationPreferenceCommandValidator : AbstractValidator<ToggleUserNotificationPreferenceCommand>
{
    public ToggleUserNotificationPreferenceCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required and must not be empty.");
    }
}
