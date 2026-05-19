using FluentValidation;

namespace NotificationService.Application.Features.Templates.Commands.UpdateNotificationTemplate;

public class UpdateNotificationTemplateCommandValidator : AbstractValidator<UpdateNotificationTemplateCommand>
{
    public UpdateNotificationTemplateCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.");

        RuleFor(x => x.TitleTemplate)
            .NotEmpty().WithMessage("TitleTemplate is required.")
            .MaximumLength(250).WithMessage("TitleTemplate must not exceed 250 characters.");

        RuleFor(x => x.BodyTemplate)
            .NotEmpty().WithMessage("BodyTemplate is required.");
    }
}
