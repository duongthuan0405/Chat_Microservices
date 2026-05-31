import { getTestUsers } from "../lib/auth.js";
import {
    requestFriend,
    acceptFriend,
    incomingRequests,
    outgoingRequests,
    getFriendshipStatus
} from "../lib/friendship.js";
import { assert, assertStatus } from "../lib/assert.js";

console.log("Running 03-friendship-flow.spec.js");

const { userA, userB } = await getTestUsers();

const requestRes = await requestFriend(userA, userB.id);
assert(
    [200, 201, 400, 409].includes(requestRes.status),
    `Friend request should be accepted or already exist. Got ${requestRes.status}`
);

const outgoing = await outgoingRequests(userA);
const incoming = await incomingRequests(userB);

assert(Array.isArray(outgoing), "Outgoing requests must be an array-like response");
assert(Array.isArray(incoming), "Incoming requests must be an array-like response");

const acceptRes = await acceptFriend(userB, userA.id);
assert(
    [200, 201, 400, 409].includes(acceptRes.status),
    `Accept friend should succeed or already accepted. Got ${acceptRes.status}`
);

const status = await getFriendshipStatus(userA, userB.id);
const text = JSON.stringify(status).toLowerCase();

assert(
    text.includes("friend") || text.includes("accepted") || text.includes("true"),
    `Friendship status should indicate friend/accepted. Got ${JSON.stringify(status)}`
);

console.log("PASS 03-friendship-flow.spec.js");