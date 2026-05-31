import { get, post, del } from "./http.js";
import { assertStatus } from "./assert.js";
import { dataOf, itemsOf } from "./shape.js";

export async function requestFriend(actor, friendId) {
    return post(
        "/api/friendships/request",
        {
            friend_id: friendId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function acceptFriend(actor, friendId) {
    return post(
        "/api/friendships/accept",
        {
            friend_id: friendId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function rejectFriend(actor, friendId) {
    return post(
        "/api/friendships/reject",
        {
            friend_id: friendId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function cancelFriend(actor, friendId) {
    return post(
        "/api/friendships/cancel",
        {
            friend_id: friendId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function blockFriend(actor, friendId) {
    return post(
        "/api/friendships/block",
        {
            friend_id: friendId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function unblockFriend(actor, friendId) {
    return post(
        "/api/friendships/unblock",
        {
            friend_id: friendId
        },
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export async function removeFriend(actor, friendId) {
    return del("/api/friendships", {
        token: actor.token,
        userId: actor.id,
        body: {
            friend_id: friendId
        }
    });
}

export async function getFriendshipStatus(actor, friendId) {
    const res = await get(
        `/api/friendships/status?friend_id=${encodeURIComponent(friendId)}`,
        {
            token: actor.token,
            userId: actor.id
        }
    );

    assertStatus(res, [200], "Get friendship status");

    return dataOf(res);
}

export async function listFriends(actor) {
    const res = await get("/api/friendships", {
        token: actor.token,
        userId: actor.id
    });

    assertStatus(res, [200], "List friends");

    return itemsOf(res);
}

export async function incomingRequests(actor) {
    const res = await get("/api/friendships/requests/incoming", {
        token: actor.token,
        userId: actor.id
    });

    assertStatus(res, [200], "List incoming friend requests");

    return itemsOf(res);
}

export async function outgoingRequests(actor) {
    const res = await get("/api/friendships/requests/outgoing", {
        token: actor.token,
        userId: actor.id
    });

    assertStatus(res, [200], "List outgoing friend requests");

    return itemsOf(res);
}