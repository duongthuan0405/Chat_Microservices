import { env } from "./env.js";
import { post } from "./http.js";
import { assertStatus, assertDefined } from "./assert.js";
import { dataOf, tokenOf, userIdOf } from "./shape.js";

async function loginUser(user) {
    const res = await post(env.authLoginPath, {
        email: user.email,
        password: user.password
    });

    assertStatus(res, [200, 201], `Login ${user.email}`);

    const data = dataOf(res);
    const token = tokenOf(data);
    const id = userIdOf(data);

    assertDefined(token, `Login response of ${user.email} must contain token`);
    assertDefined(id, `Login response of ${user.email} must contain id`);

    return {
        email: user.email,
        id,
        token
    };
}

async function registerUser(user) {
    const res = await post(env.authRegisterPath, {
        email: user.email,
        password: user.password
    });

    if (res.status === 400 || res.status === 409) {
        return loginUser(user);
    }

    assertStatus(res, [200, 201], `Register ${user.email}`);

    const data = dataOf(res);
    const token = tokenOf(data);
    const id = userIdOf(data);

    assertDefined(token, `Register response of ${user.email} must contain token`);
    assertDefined(id, `Register response of ${user.email} must contain id`);

    return {
        email: user.email,
        id,
        token
    };
}

export async function getTestUsers() {
    const loader = env.testUserMode === "register" ? registerUser : loginUser;

    const [userA, userB, userC] = await Promise.all([
        loader(env.userA),
        loader(env.userB),
        loader(env.userC)
    ]);

    return { userA, userB, userC };
}