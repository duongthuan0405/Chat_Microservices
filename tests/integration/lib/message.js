import { get, post, put, del } from "./http.js";
import { assertStatus, assertDefined } from "./assert.js";
import { dataOf, idOf } from "./shape.js";

export async function sendMessage(actor, conversationId, content, type = "Text") {
    const res = await post(
        "/api/messages",
        {
            conversationId,
            content,
            type
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );

    assertStatus(res, [200, 201], "Send message");

    const data = dataOf(res);
    const messageId = idOf(data);

    assertDefined(messageId, "Send message response must contain message id");

    return {
        raw: data,
        id: messageId
    };
}

export async function getMessages(actor, conversationId, pageNumber = 1, pageSize = 20) {
    return get(
        `/api/messages/conversation/${conversationId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function getLatestMessages(actor, conversationIds = []) {
    return post(
        "/api/messages/conversations/latest",
        {
            conversationIds
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function getLatestMessageByConversation(actor, conversationId) {
    return get(
        `/api/messages/conversation/${conversationId}/latest`,
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function editMessage(actor, messageId, newContent) {
    return put(
        `/api/messages/${messageId}`,
        {
            newContent
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function deleteMessage(actor, messageId) {
    return del(`/api/messages/${messageId}`, {
        token: actor.token,
        userId: actor.id
    });
}

export async function markRead(actor, messageId) {
    return post(
        `/api/messages/${messageId}/read`,
        {},
        {
            token: actor.token,
            userId: actor.id
        }
    );
}