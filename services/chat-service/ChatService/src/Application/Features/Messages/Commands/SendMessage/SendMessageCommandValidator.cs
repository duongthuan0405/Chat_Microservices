using System;
using FluentValidation;
using ChatService.Domain.Enums;

namespace ChatService.Application.Features.Messages.Commands.SendMessage;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("ConversationId is required.")
            .NotEqual(Guid.Empty).WithMessage("ConversationId must not be an empty Guid.");

        RuleFor(x => x.SenderId)
            .NotEmpty().WithMessage("SenderId is required.")
            .NotEqual(Guid.Empty).WithMessage("SenderId must not be an empty Guid.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required.")
            .MaximumLength(4000).WithMessage("Content must not exceed 4000 characters.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Type must be a valid MessageType.");
    }
}
