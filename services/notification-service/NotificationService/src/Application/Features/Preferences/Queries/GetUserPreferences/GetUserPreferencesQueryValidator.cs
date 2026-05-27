using FluentValidation;

namespace NotificationService.Application.Features.Preferences.Queries.GetUserPreferences;

public class GetUserPreferencesQueryValidator : AbstractValidator<GetUserPreferencesQuery>
{
    public GetUserPreferencesQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required and must not be empty.");
    }
}
