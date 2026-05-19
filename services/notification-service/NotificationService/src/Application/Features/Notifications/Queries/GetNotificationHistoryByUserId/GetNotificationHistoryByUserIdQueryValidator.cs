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
    }
}
