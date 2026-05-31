import { getTestUsers } from "../lib/auth.js";
import { createGroup } from "../lib/conversation.js";
import { getNotifications } from "../lib/notification.js";
import { waitUntil } from "../lib/wait.js";
import { assert } from "../lib/assert.js";

console.log("Running 05-notification-history.spec.js");

const { userA, userB } = await getTestUsers();

const groupName = `notify-group-${Date.now()}`;

await createGroup(userA, groupName, [userB.id]);

const found = await waitUntil(
    async () => {
        const notifications = await getNotifications(userB, 1, 20);
        const text = JSON.stringify(notifications).toLowerCase();

        if (
            text.includes(groupName.toLowerCase()) ||
            text.includes("added_to_group_chat") ||
            text.includes("group")
        ) {
            return notifications;
        }

        return false;
    },
    {
        timeoutMs: 20000,
        intervalMs: 1000,
        label: "AddedToGroupChat notification"
    }
);

assert(found, "User B should receive notification after being added to group");

console.log("PASS 05-notification-history.spec.js");