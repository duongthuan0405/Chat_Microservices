using System;
using FluentValidation;

namespace ChatService.Application.Features.Messages.Commands.EditMessage;

public class EditMessageCommandValidator : AbstractValidator<EditMessageCommand>
{
    public EditMessageCommandValidator()
    {
        RuleFor(x => x.MessageId)
            .NotEmpty().WithMessage("MessageId is required.")
            .NotEqual(Guid.Empty).WithMessage("MessageId must not be an empty Guid.");

        RuleFor(x => x.SenderId)
            .NotEmpty().WithMessage("SenderId is required.")
            .NotEqual(Guid.Empty).WithMessage("SenderId must not be an empty Guid.");

        RuleFor(x => x.NewContent)
            .NotEmpty().WithMessage("NewContent is required.")
            .MaximumLength(4000).WithMessage("NewContent must not exceed 4000 characters.");
    }
}
