import { get } from "../lib/http.js";
import { getTestUsers } from "../lib/auth.js";
import { assert, assertStatus } from "../lib/assert.js";

console.log("Running 01-auth-gateway.spec.js");

const noTokenRes = await get("/api/conversations");
assert(
    [401, 403].includes(noTokenRes.status),
    `Private API without token must be blocked. Got ${noTokenRes.status}`
);

const badTokenRes = await get("/api/conversations", {
    token: "invalid-token"
});
assert(
    [401, 403].includes(badTokenRes.status),
    `Private API with invalid token must be blocked. Got ${badTokenRes.status}`
);

const { userA } = await getTestUsers();

const validTokenRes = await get("/api/conversations", {
    token: userA.token,
    userId: userA.id
});

assert(
    ![401, 403].includes(validTokenRes.status),
    `Private API with valid token must not be unauthorized. Got ${validTokenRes.status}`
);

console.log("PASS 01-auth-gateway.spec.js");