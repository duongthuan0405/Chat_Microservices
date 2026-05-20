using System;
using FluentValidation;

namespace NotificationService.Application.Features.Notifications.Queries.GetNotificationHistoryByUserId;

public class GetNotificationHistoryByUserIdQueryValidator : AbstractValidator<GetNotificationHistoryByUserIdQuery>
{
    public GetNotificationHistoryByUserIdQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .NotEqual(Guid.Empty).WithMessage("UserId must not be an empty Guid.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be greater than or equal to 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("PageSize must be greater than or equal to 1.");
    }
}
