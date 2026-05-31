import http from "k6/http";
import { check } from "k6";
import { authHeaders, authLoginPath, baseUrl, required } from "./config.js";

export function loginTestUser() {
    const res = http.post(
        `${baseUrl()}${authLoginPath()}`,
        JSON.stringify({
            email: required("USER_A_EMAIL"),
            password: required("USER_A_PASSWORD")
        }),
        {
            headers: authHeaders(),
            tags: {
                name: "POST /api/auth/login"
            }
        }
    );

    check(res, {
        "login returns 200 or 201": (r) => r.status === 200 || r.status === 201
    });

    if (res.status !== 200 && res.status !== 201) {
        throw new Error(`Login failed. Status=${res.status}. Body=${res.body}`);
    }

    const body = res.json();
    const data = body.data || body.Data || body;

    const token = data.token || data.Token || data.accessToken || data.AccessToken;
    const userId = data.id || data.Id || data.userId || data.UserId;

    if (!token) {
        throw new Error(`Login response does not contain token. Body=${res.body}`);
    }

    if (!userId) {
        throw new Error(`Login response does not contain user id. Body=${res.body}`);
    }

    return {
        token,
        userId
    };
}