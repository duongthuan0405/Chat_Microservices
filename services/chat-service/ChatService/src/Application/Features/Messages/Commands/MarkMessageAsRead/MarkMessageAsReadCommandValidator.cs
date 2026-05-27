using System;
using FluentValidation;

namespace ChatService.Application.Features.Messages.Commands.MarkMessageAsRead;

public class MarkMessageAsReadCommandValidator : AbstractValidator<MarkMessageAsReadCommand>
{
    public MarkMessageAsReadCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .NotEqual(Guid.Empty).WithMessage("UserId must not be an empty Guid.");

        RuleFor(x => x.MessageId)
            .NotEmpty().WithMessage("MessageId is required.")
            .NotEqual(Guid.Empty).WithMessage("MessageId must not be an empty Guid.");
    }
}
