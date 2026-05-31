export function dataOf(response) {
    if (!response || response.body === null || response.body === undefined) {
        return null;
    }

    if (response.body.data !== undefined) {
        return response.body.data;
    }

    if (response.body.Data !== undefined) {
        return response.body.Data;
    }

    return response.body;
}

export function itemsOf(response) {
    const data = dataOf(response);

    if (!data) return [];

    if (Array.isArray(data)) return data;

    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.Items)) return data.Items;

    if (Array.isArray(data.members)) return data.members;
    if (Array.isArray(data.Members)) return data.Members;

    if (Array.isArray(data.conversations)) return data.conversations;
    if (Array.isArray(data.Conversations)) return data.Conversations;

    if (Array.isArray(data.notifications)) return data.notifications;
    if (Array.isArray(data.Notifications)) return data.Notifications;

    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.Data && Array.isArray(data.Data)) return data.Data;

    if (data.data && Array.isArray(data.data.items)) return data.data.items;
    if (data.Data && Array.isArray(data.Data.Items)) return data.Data.Items;

    return [];
}

export function idOf(entity) {
    return (
        entity?.id ||
        entity?.Id ||
        entity?.conversationId ||
        entity?.ConversationId ||
        entity?.conversation_id ||
        entity?.messageId ||
        entity?.MessageId ||
        entity?.historyId ||
        entity?.HistoryId
    );
}

export function tokenOf(entity) {
    return (
        entity?.token ||
        entity?.Token ||
        entity?.accessToken ||
        entity?.AccessToken
    );
}

export function userIdOf(entity) {
    return (
        entity?.id ||
        entity?.Id ||
        entity?.userId ||
        entity?.UserId ||
        entity?.user_id
    );
}