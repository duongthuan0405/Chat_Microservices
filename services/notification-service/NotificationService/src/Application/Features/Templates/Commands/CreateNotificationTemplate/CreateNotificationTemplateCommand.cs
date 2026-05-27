using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Exceptions;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Features.Templates.Commands.CreateNotificationTemplate;

public class CreateNotificationTemplateCommand : IRequest<CreateNotificationTemplateCommandResponse>
{
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
}

public class CreateNotificationTemplateCommandResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class CreateNotificationTemplateCommandHandler : IRequestHandler<CreateNotificationTemplateCommand, CreateNotificationTemplateCommandResponse>
{
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateNotificationTemplateCommandHandler(
        INotificationTemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateNotificationTemplateCommandResponse> Handle(CreateNotificationTemplateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var existing = await _templateRepository.GetByCodeAsync(request.Code, cancellationToken);
            if (existing != null)
            {
                throw new ConflictException($"Notification template with code '{request.Code}' already exists.");
            }

            var template = new NotificationTemplate.NotificationTemplateBuilder()
                .WithCode(request.Code)
                .WithTitleTemplate(request.TitleTemplate)
                .WithBodyTemplate(request.BodyTemplate)
                .WithIsActive(true) // Defaults to active on creation
                .Build();

            await _templateRepository.AddAsync(template, cancellationToken);
            await _unitOfWork.FinishAsync();

            return new CreateNotificationTemplateCommandResponse
            {
                Id = template.Id,
                Code = template.Code,
                TitleTemplate = template.TitleTemplate,
                BodyTemplate = template.BodyTemplate,
                IsActive = template.IsActive,
                CreatedAt = template.CreatedAt,
                UpdatedAt = template.UpdatedAt
            };
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
