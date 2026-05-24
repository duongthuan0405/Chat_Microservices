using FluentValidation;

namespace NotificationService.Application.Features.Templates.Commands.CreateNotificationTemplate;

public class CreateNotificationTemplateCommandValidator : AbstractValidator<CreateNotificationTemplateCommand>
{
    public CreateNotificationTemplateCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(100).WithMessage("Code must not exceed 100 characters.");

        RuleFor(x => x.TitleTemplate)
            .NotEmpty().WithMessage("TitleTemplate is required.")
            .MaximumLength(250).WithMessage("TitleTemplate must not exceed 250 characters.");

        RuleFor(x => x.BodyTemplate)
            .NotEmpty().WithMessage("BodyTemplate is required.");
    }
}
