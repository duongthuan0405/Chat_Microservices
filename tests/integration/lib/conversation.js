import { get, post, del, patch } from "./http.js";
import { assertStatus, assertDefined } from "./assert.js";
import { dataOf, idOf, itemsOf } from "./shape.js";

export async function createDirect(actor, memberId) {
    const res = await post(
        "/api/conversations/direct",
        {
            member_id: memberId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );

    assertStatus(res, [200, 201], "Create direct conversation");

    const data = dataOf(res);
    const conversationId = idOf(data);

    assertDefined(conversationId, "Create direct response must contain conversation id");

    return {
        raw: data,
        id: conversationId
    };
}

export async function createGroup(owner, name, memberIds = []) {
    const res = await post(
        "/api/conversations/groups",
        {
            name,
            avatarUrl: "",
            member_ids: memberIds
        },
        {
            token: owner.token,
            userId: owner.id
        }
    );

    assertStatus(res, [200, 201], "Create group conversation");

    const data = dataOf(res);
    const conversationId = idOf(data);

    assertDefined(conversationId, "Create group response must contain conversation id");

    return {
        raw: data,
        id: conversationId
    };
}

export async function listMyConversations(user) {
    const res = await get("/api/conversations", {
        token: user.token,
        userId: user.id
    });

    assertStatus(res, [200], "List my conversations");

    return itemsOf(res);
}

export async function getConversation(user, conversationId) {
    return get(`/api/conversations/${conversationId}`, {
        token: user.token,
        userId: user.id
    });
}

export async function listMembers(user, conversationId) {
    const res = await get(`/api/conversations/${conversationId}/members`, {
        token: user.token,
        userId: user.id
    });

    assertStatus(res, [200], "List conversation members");

    return itemsOf(res);
}

export async function addMember(actor, conversationId, memberId) {
    return post(
        `/api/conversations/${conversationId}/members`,
        {
            member_id: memberId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function removeMember(actor, conversationId, memberId) {
    return del(`/api/conversations/${conversationId}/members/${memberId}`, {
        token: actor.token,
        userId: actor.id
    });
}

export async function leaveConversation(actor, conversationId) {
    return post(
        `/api/conversations/${conversationId}/leave`,
        {},
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function changeMemberRole(actor, conversationId, memberId, role) {
    return patch(
        `/api/conversations/${conversationId}/members/${memberId}/role`,
        {
            role
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export function findMember(members, userId) {
    return members.find((member) => {
        const current =
            member.userId ||
            member.UserId ||
            member.user_id ||
            member.UserID;

        return String(current).toLowerCase() === String(userId).toLowerCase();
    });
}

export function roleOf(member) {
    return member?.role || member?.Role || "";
}

export function statusOf(member) {
    return member?.status || member?.Status || "";
}