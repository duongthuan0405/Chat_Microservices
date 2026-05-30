using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using ChatService.Application.ExternalServices;

namespace ChatService.Infrastructure.ExternalServices;

public class ConversationServiceClient : IConversationServiceClient
{
    private readonly HttpClient _httpClient;

    public ConversationServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> IsMemberAsync(Guid conversationId, Guid userId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/internal/conversations/{conversationId}/members/{userId}/exists", cancellationToken);
        if (!response.IsSuccessStatusCode) return false;

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<IsMemberData>>(cancellationToken: cancellationToken);
        return result?.Data?.IsMember ?? false;
    }

    public async Task<List<Guid>> GetMemberIdsAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/internal/conversations/{conversationId}/members", cancellationToken);
        if (!response.IsSuccessStatusCode) return new List<Guid>();

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<MemberIdsData>>(cancellationToken: cancellationToken);
        
        var guidList = new List<Guid>();
        if (result?.Data?.MemberIds != null)
        {
            foreach (var idStr in result.Data.MemberIds)
            {
                if (Guid.TryParse(idStr, out var g))
                {
                    guidList.Add(g);
                }
            }
        }
        return guidList;
    }

    private class ApiResponse<T>
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("data")]
        public T Data { get; set; }
    }

    private class IsMemberData
    {
        [JsonPropertyName("isMember")]
        public bool IsMember { get; set; }
    }

    private class MemberIdsData
    {
        [JsonPropertyName("memberIds")]
        public List<string> MemberIds { get; set; }
    }
}
