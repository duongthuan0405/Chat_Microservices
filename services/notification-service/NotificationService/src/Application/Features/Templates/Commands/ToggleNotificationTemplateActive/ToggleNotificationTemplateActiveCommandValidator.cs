using FluentValidation;

namespace NotificationService.Application.Features.Templates.Commands.ToggleNotificationTemplateActive;

public class ToggleNotificationTemplateActiveCommandValidator : AbstractValidator<ToggleNotificationTemplateActiveCommand>
{
    public ToggleNotificationTemplateActiveCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Template Code is required and cannot be empty.");
    }
}
