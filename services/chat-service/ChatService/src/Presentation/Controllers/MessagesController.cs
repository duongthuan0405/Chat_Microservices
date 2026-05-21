using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ChatService.Application.Features.Messages.Commands.SendMessage;
using ChatService.Application.Features.Messages.Commands.EditMessage;
using ChatService.Application.Features.Messages.Commands.SoftDeleteMessage;
using ChatService.Application.Features.Messages.Commands.MarkMessageAsRead;
using ChatService.Application.Features.Messages.Queries.GetMessages;
using ChatService.Application.Features.Messages.Queries.GetLatestMessages;
using ChatService.Application.Common.Models;
using ChatService.Application.Exceptions;
using ChatService.Presentation.Common;
using ChatService.Presentation.DTOs;
using ChatService.Presentation.Extensions;

namespace ChatService.Presentation.Controllers;

[ApiController]
[Route("api/messages")]
public class MessagesController : ControllerBase
{
    private readonly ISender _sender;

    public MessagesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<ActionResult<ApiSuccessResponse<MessageResponseDto>>> SendMessageAsync(
        [FromBody] SendMessageRequestDto requestDto)
    {
        var currentUserId = this.GetCurrentUserId();

        var command = new SendMessageCommand
        {
            ConversationId = requestDto.ConversationId,
            SenderId = currentUserId,
            Content = requestDto.Content,
            Type = requestDto.Type
        };

        var result = await _sender.Send(command);

        var response = new MessageResponseDto
        {
            Id = result.Id,
            ConversationId = result.ConversationId,
            SenderId = result.SenderId,
            Content = result.Content,
            Type = result.Type.ToString(),
            IsDeleted = result.IsDeleted,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt    
        };

        return Created(string.Empty, new ApiSuccessResponse<MessageResponseDto>(response, "Message sent successfully."));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiSuccessResponse<MessageResponseDto>>> EditMessageAsync(
        [FromRoute] Guid id,
        [FromBody] EditMessageRequestDto requestDto)
    {
        var currentUserId = this.GetCurrentUserId();

        var command = new EditMessageCommand
        {
            MessageId = id,
            SenderId = currentUserId,
            NewContent = requestDto.NewContent
        };

        var result = await _sender.Send(command);

        var response = new MessageResponseDto
        {
            Id = result.Id,
            ConversationId = result.ConversationId,
            SenderId = result.SenderId,
            Content = result.Content,
            Type = result.Type.ToString(),
            IsDeleted = result.IsDeleted,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt,
        };

        return Ok(new ApiSuccessResponse<MessageResponseDto>(response, "Message edited successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiSuccessResponse<SoftDeleteMessageResponseDto>>> SoftDeleteMessageAsync(
        [FromRoute] Guid id)
    {
        var currentUserId = this.GetCurrentUserId();

        var command = new SoftDeleteMessageCommand
        {
            MessageId = id,
            SenderId = currentUserId
        };

        var result = await _sender.Send(command);

        var response = new SoftDeleteMessageResponseDto
        {
            Id = result.Id,
            ConversationId = result.ConversationId,
            IsDeleted = result.IsDeleted
        };

        return Ok(new ApiSuccessResponse<SoftDeleteMessageResponseDto>(response, "Message deleted successfully."));
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiSuccessResponse<MessageReadStatusResponseDto>>> MarkAsReadAsync(
        [FromRoute] Guid id)
    {
        var currentUserId = this.GetCurrentUserId();

        var command = new MarkMessageAsReadCommand
        {
            MessageId = id,
            UserId = currentUserId
        };

        var result = await _sender.Send(command);

        var response = new MessageReadStatusResponseDto
        {
            Id = result.Id,
            ConversationId = result.ConversationId,
            UserId = result.UserId,
            LastReadAt = result.LastReadAt
        };

        return Ok(new ApiSuccessResponse<MessageReadStatusResponseDto>(response, "Message marked as read successfully."));
    }

    [HttpGet("conversation/{conversationId}")]
    public async Task<ActionResult<ApiSuccessResponse<PagedResult<MessageResponseDto>>>> GetMessagesAsync(
        [FromRoute] Guid conversationId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUserId = this.GetCurrentUserId();

        var query = new GetMessagesQuery
        {
            ConversationId = conversationId,
            UserId = currentUserId,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _sender.Send(query);

        var items = result.Items.Select(item => new MessageResponseDto
        {
            Id = item.Id,
            ConversationId = item.ConversationId,
            SenderId = item.SenderId,
            Content = item.Content,
            Type = item.Type.ToString(),
            IsDeleted = item.IsDeleted,
            IsRead = item.IsRead,
            ReadBy = item.ReadBy,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        }).ToList();

        var response = new PagedResult<MessageResponseDto>(
            items,
            result.TotalCount,
            result.PageNumber,
            result.PageSize
        );

        return Ok(new ApiSuccessResponse<PagedResult<MessageResponseDto>>(response, "Conversation messages retrieved successfully."));
    }

    [HttpPost("conversations/latest")]
    public async Task<ActionResult<ApiSuccessResponse<Dictionary<Guid, MessageResponseDto>>>> GetLatestMessagesAsync(
        [FromBody] GetLatestMessagesRequestDto requestDto)
    {
        var currentUserId = this.GetCurrentUserId();

        var query = new GetLatestMessagesQuery
        {
            ConversationIds = requestDto.ConversationIds,
            UserId = currentUserId
        };

        var result = await _sender.Send(query);

        var response = result.ToDictionary(
            kvp => kvp.Key,
            kvp => new MessageResponseDto
            {
                Id = kvp.Value.Id,
                ConversationId = kvp.Value.ConversationId,
                SenderId = kvp.Value.SenderId,
                Content = kvp.Value.Content,
                Type = kvp.Value.Type.ToString(),
                IsDeleted = kvp.Value.IsDeleted,
                IsRead = kvp.Value.IsRead,
                CreatedAt = kvp.Value.CreatedAt,
                UpdatedAt = kvp.Value.UpdatedAt
            });

        return Ok(new ApiSuccessResponse<Dictionary<Guid, MessageResponseDto>>(response, "Latest messages retrieved successfully."));
    }

    [HttpGet("conversation/{conversationId}/latest")]
    public async Task<ActionResult<ApiSuccessResponse<MessageResponseDto?>>> GetLatestMessageByConversationAsync(
        [FromRoute] Guid conversationId)
    {
        var currentUserId = this.GetCurrentUserId();

        var query = new GetLatestMessagesQuery
        {
            ConversationIds = new List<Guid> { conversationId },
            UserId = currentUserId
        };

        var result = await _sender.Send(query);

        if (result.TryGetValue(conversationId, out var messageDto))
        {
            var response = new MessageResponseDto
            {
                Id = messageDto.Id,
                ConversationId = messageDto.ConversationId,
                SenderId = messageDto.SenderId,
                Content = messageDto.Content,
                Type = messageDto.Type.ToString(),
                IsDeleted = messageDto.IsDeleted,
                IsRead = messageDto.IsRead,
                CreatedAt = messageDto.CreatedAt,
                UpdatedAt = messageDto.UpdatedAt
            };

            return Ok(new ApiSuccessResponse<MessageResponseDto?>(response, "Latest message retrieved successfully."));
        }

        return Ok(new ApiSuccessResponse<MessageResponseDto?>(null, "No messages found in this conversation."));
    }
}

