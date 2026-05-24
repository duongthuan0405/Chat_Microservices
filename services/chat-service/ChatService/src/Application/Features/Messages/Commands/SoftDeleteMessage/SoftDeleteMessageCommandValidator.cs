using System;
using FluentValidation;

namespace ChatService.Application.Features.Messages.Commands.SoftDeleteMessage;

public class SoftDeleteMessageCommandValidator : AbstractValidator<SoftDeleteMessageCommand>
{
    public SoftDeleteMessageCommandValidator()
    {
        RuleFor(x => x.MessageId)
            .NotEmpty().WithMessage("MessageId is required.")
            .NotEqual(Guid.Empty).WithMessage("MessageId must not be an empty Guid.");

        RuleFor(x => x.SenderId)
            .NotEmpty().WithMessage("SenderId is required.")
            .NotEqual(Guid.Empty).WithMessage("SenderId must not be an empty Guid.");
    }
}
