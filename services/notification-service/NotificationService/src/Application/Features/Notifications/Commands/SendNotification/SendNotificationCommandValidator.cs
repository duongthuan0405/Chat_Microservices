using System;
using FluentValidation;

namespace NotificationService.Application.Features.Notifications.Commands.SendNotification;

public class SendNotificationCommandValidator : AbstractValidator<SendNotificationCommand>
{
    public SendNotificationCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .NotEqual(Guid.Empty).WithMessage("UserId must not be an empty Guid.");

        RuleFor(x => x.TemplateCode)
            .NotEmpty().WithMessage("TemplateCode is required.");
    }
}
