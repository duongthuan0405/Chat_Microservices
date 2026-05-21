using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using ChatService.Application.ExternalServices;

namespace ChatService.Presentation.Hubs;

public class ChatHub : Hub
{
    private readonly IConversationServiceClient _conversationServiceClient;

    public ChatHub(IConversationServiceClient conversationServiceClient)
    {
        _conversationServiceClient = conversationServiceClient;
    }

    public async Task JoinConversation(string conversationIdStr)
    {
        if (Guid.TryParse(conversationIdStr, out var conversationId))
        {
            var userIdStr = Context.UserIdentifier;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                // Verify membership before allowing the user to join the real-time conversation group
                if (await _conversationServiceClient.IsMemberAsync(conversationId, userId))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, conversationIdStr);
                }
            }
        }
    }

    public async Task LeaveConversation(string conversationIdStr)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationIdStr);
    }
}
