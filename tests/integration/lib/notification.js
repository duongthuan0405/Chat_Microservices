import { get, post } from "./http.js";
import { assertStatus } from "./assert.js";
import { dataOf, itemsOf } from "./shape.js";

export async function getNotifications(actor, pageNumber = 1, pageSize = 20) {
    const res = await get(
        `/api/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
            token: actor.token,
            userId: actor.id
        }
    );

    assertStatus(res, [200], "Get notifications");

    return itemsOf(res);
}

export async function getNotificationsPage(actor, pageNumber = 1, pageSize = 20) {
    const res = await get(
        `/api/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
            token: actor.token,
            userId: actor.id
        }
    );

    assertStatus(res, [200], "Get notifications page");

    return dataOf(res);
}

export async function markNotificationRead(actor, notificationId) {
    return post(
        `/api/notifications/${notificationId}/read`,
        {},
        {
            token: actor.token,
            userId: actor.id
        }
    );
}

export function containsNotification(items, predicate) {
    return items.some(predicate);
}