import { getTestUsers } from "../lib/auth.js";
import {
    createGroup,
    getConversation,
    listMembers,
    addMember,
    findMember,
    roleOf
} from "../lib/conversation.js";
import { assert, assertStatus } from "../lib/assert.js";

console.log("Running 02-conversation-permission.spec.js");

const { userA, userB, userC } = await getTestUsers();

const groupName = `it-group-${Date.now()}`;
const group = await createGroup(userA, groupName, [userB.id]);

const membersAfterCreate = await listMembers(userA, group.id);

const owner = findMember(membersAfterCreate, userA.id);
const memberB = findMember(membersAfterCreate, userB.id);

assert(owner, "Creator must be in group members");
assert(memberB, "User B must be in group members");

assert(
    String(roleOf(owner)).toLowerCase() === "owner",
    `Creator must be OWNER, got ${roleOf(owner)}`
);

assert(
    String(roleOf(memberB)).toLowerCase() === "member",
    `Added user must be MEMBER, got ${roleOf(memberB)}`
);

const outsiderView = await getConversation(userC, group.id);
assertStatus(outsiderView, [400, 403], "Outsider cannot view private group");

const memberAddRes = await addMember(userB, group.id, userC.id);
assert(
    [400, 403].includes(memberAddRes.status),
    `MEMBER should not be able to add member. Got ${memberAddRes.status}`
);

const ownerAddRes = await addMember(userA, group.id, userC.id);
assertStatus(ownerAddRes, [200, 201], "OWNER can add member");

const membersAfterAdd = await listMembers(userA, group.id);
const memberC = findMember(membersAfterAdd, userC.id);

assert(memberC, "User C must be added by owner");
assert(
    String(roleOf(memberC)).toLowerCase() === "member",
    `User C role must be MEMBER, got ${roleOf(memberC)}`
);

console.log("PASS 02-conversation-permission.spec.js");