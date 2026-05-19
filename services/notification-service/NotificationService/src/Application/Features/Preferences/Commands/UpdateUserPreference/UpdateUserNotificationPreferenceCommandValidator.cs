using FluentValidation;

namespace NotificationService.Application.Features.Preferences.Commands.UpdateUserPreference;

public class UpdateUserNotificationPreferenceCommandValidator : AbstractValidator<UpdateUserNotificationPreferenceCommand>
{
    public UpdateUserNotificationPreferenceCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}
