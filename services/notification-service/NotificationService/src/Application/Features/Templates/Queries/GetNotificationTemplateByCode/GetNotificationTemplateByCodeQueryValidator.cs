using FluentValidation;

namespace NotificationService.Application.Features.Templates.Queries.GetNotificationTemplateByCode;

public class GetNotificationTemplateByCodeQueryValidator : AbstractValidator<GetNotificationTemplateByCodeQuery>
{
    public GetNotificationTemplateByCodeQueryValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Template Code is required and cannot be empty.");
    }
}
