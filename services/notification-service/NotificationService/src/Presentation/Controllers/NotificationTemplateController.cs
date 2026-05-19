using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Features.Templates.Commands.CreateNotificationTemplate;
using NotificationService.Application.Features.Templates.Commands.ToggleNotificationTemplateActive;
using NotificationService.Application.Features.Templates.Commands.UpdateNotificationTemplate;
using NotificationService.Application.Features.Templates.Queries.GetNotificationTemplateByCode;
using NotificationService.Presentation.Common;
using NotificationService.Presentation.DTOs;

namespace NotificationService.Presentation.Controllers;

[ApiController]
[Route("api/templates")]
public class NotificationTemplateController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationTemplateController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<ApiSuccessResponse<NotificationTemplateResponseDto>>> GetByCodeAsync(
        [FromRoute] string code)
    {
        var query = new GetNotificationTemplateByCodeQuery { Code = code };
        var result = await _sender.Send(query);

        var response = new NotificationTemplateResponseDto
        {
            Id = result.Id,
            Code = result.Code,
            TitleTemplate = result.TitleTemplate,
            BodyTemplate = result.BodyTemplate,
            IsActive = result.IsActive,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

        return Ok(new ApiSuccessResponse<NotificationTemplateResponseDto>(response, "Notification template retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiSuccessResponse<NotificationTemplateResponseDto>>> CreateAsync(
        [FromBody] CreateNotificationTemplateRequestDto request)
    {
        var command = new CreateNotificationTemplateCommand
        {
            Code = request.Code,
            TitleTemplate = request.TitleTemplate,
            BodyTemplate = request.BodyTemplate
        };
        var result = await _sender.Send(command);

        var response = new NotificationTemplateResponseDto
        {
            Id = result.Id,
            Code = result.Code,
            TitleTemplate = result.TitleTemplate,
            BodyTemplate = result.BodyTemplate,
            IsActive = result.IsActive,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

        return Ok(new ApiSuccessResponse<NotificationTemplateResponseDto>(response, "Notification template created successfully."));
    }

    [HttpPut("{code}")]
    public async Task<ActionResult<ApiSuccessResponse<NotificationTemplateResponseDto>>> UpdateAsync(
        [FromRoute] string code,
        [FromBody] UpdateNotificationTemplateRequestDto request)
    {
        var command = new UpdateNotificationTemplateCommand
        {
            Code = code,
            TitleTemplate = request.TitleTemplate,
            BodyTemplate = request.BodyTemplate
        };
        var result = await _sender.Send(command);

        var response = new NotificationTemplateResponseDto
        {
            Id = result.Id,
            Code = result.Code,
            TitleTemplate = result.TitleTemplate,
            BodyTemplate = result.BodyTemplate,
            IsActive = result.IsActive,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

        return Ok(new ApiSuccessResponse<NotificationTemplateResponseDto>(response, "Notification template updated successfully."));
    }

    [HttpPost("{code}/toggle-active")]
    public async Task<ActionResult<ApiSuccessResponse<NotificationTemplateResponseDto>>> ToggleActiveAsync(
        [FromRoute] string code)
    {
        var command = new ToggleNotificationTemplateActiveCommand { Code = code };
        var result = await _sender.Send(command);

        var response = new NotificationTemplateResponseDto
        {
            Id = result.Id,
            Code = result.Code,
            TitleTemplate = result.TitleTemplate,
            BodyTemplate = result.BodyTemplate,
            IsActive = result.IsActive,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt
        };

        return Ok(new ApiSuccessResponse<NotificationTemplateResponseDto>(response, "Notification template activation status toggled successfully."));
    }
}
