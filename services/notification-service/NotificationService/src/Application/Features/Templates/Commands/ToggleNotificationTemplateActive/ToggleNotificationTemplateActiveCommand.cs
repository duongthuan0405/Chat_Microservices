using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Exceptions;
using NotificationService.Application.Persistence;
using NotificationService.Application.Persistence.Repositories;

namespace NotificationService.Application.Features.Templates.Commands.ToggleNotificationTemplateActive;

public class ToggleNotificationTemplateActiveCommand : IRequest<ToggleNotificationTemplateActiveCommandResponse>
{
    public string Code { get; set; } = null!;
}

public class ToggleNotificationTemplateActiveCommandResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class ToggleNotificationTemplateActiveCommandHandler : IRequestHandler<ToggleNotificationTemplateActiveCommand, ToggleNotificationTemplateActiveCommandResponse>
{
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleNotificationTemplateActiveCommandHandler(
        INotificationTemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ToggleNotificationTemplateActiveCommandResponse> Handle(ToggleNotificationTemplateActiveCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginAsync();

            var template = await _templateRepository.GetByCodeAsync(request.Code, cancellationToken);
            if (template == null)
            {
                throw new NotFoundException($"Notification template with code '{request.Code}' was not found.");
            }

            // Invert active status
            template.IsActive = !template.IsActive;
            template.UpdatedAt = DateTimeOffset.UtcNow;

            await _templateRepository.UpdateAsync(template, cancellationToken);
            await _unitOfWork.FinishAsync();

            return new ToggleNotificationTemplateActiveCommandResponse
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
