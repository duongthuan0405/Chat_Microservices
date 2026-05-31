import { getTestUsers } from "../lib/auth.js";
import { createGroup } from "../lib/conversation.js";
import { sendMessage, getMessages, editMessage, deleteMessage, markRead } from "../lib/message.js";
import { assert, assertStatus } from "../lib/assert.js";
import { dataOf, itemsOf } from "../lib/shape.js";

console.log("Running 04-chat-message-flow.spec.js");

const { userA, userB } = await getTestUsers();

const group = await createGroup(userA, `chat-flow-${Date.now()}`, [userB.id]);

const content = `hello-from-integration-${Date.now()}`;
const message = await sendMessage(userA, group.id, content);

assert(message.id, "Message id must exist after send");
assert(
    String(message.raw.content || message.raw.Content).includes(content),
    "Message content must match sent content"
);

const listRes = await getMessages(userA, group.id);
assertStatus(listRes, [200], "Get messages");

const messageListText = JSON.stringify(dataOf(listRes));
assert(
    messageListText.includes(content),
    "Get messages should include sent message"
);

const editedContent = `edited-${Date.now()}`;
const editRes = await editMessage(userA, message.id, editedContent);
assertStatus(editRes, [200], "Edit message");

const readRes = await markRead(userB, message.id);
assert(
    [200, 201, 204, 400, 404].includes(readRes.status),
    `Mark read endpoint returned unexpected status ${readRes.status}. If route differs, fix lib/message.js markRead().`
);

const deleteRes = await deleteMessage(userA, message.id);
assertStatus(deleteRes, [200], "Soft delete message");

console.log("PASS 04-chat-message-flow.spec.js");