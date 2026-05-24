using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NotificationService.Application.Exceptions;
using NotificationService.Application.Persistence.Repositories;

namespace NotificationService.Application.Features.Templates.Queries.GetNotificationTemplateByCode;

public class GetNotificationTemplateByCodeQuery : IRequest<GetNotificationTemplateByCodeQueryResponse>
{
    public string Code { get; set; } = null!;
}

public class GetNotificationTemplateByCodeQueryResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string TitleTemplate { get; set; } = null!;
    public string BodyTemplate { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class GetNotificationTemplateByCodeQueryHandler : IRequestHandler<GetNotificationTemplateByCodeQuery, GetNotificationTemplateByCodeQueryResponse>
{
    private readonly INotificationTemplateRepository _templateRepository;

    public GetNotificationTemplateByCodeQueryHandler(INotificationTemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<GetNotificationTemplateByCodeQueryResponse> Handle(GetNotificationTemplateByCodeQuery request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByCodeAsync(request.Code, cancellationToken);

        if (template == null)
        {
            throw new NotFoundException($"Notification template with code '{request.Code}' was not found.");
        }

        return new GetNotificationTemplateByCodeQueryResponse
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
}
