import http from "k6/http";
import { check, sleep } from "k6";
import { authHeaders, baseUrl, optional } from "../lib/config.js";
import { loginTestUser } from "../lib/auth.js";

export const options = {
    scenarios: {
        conversation_list: {
            executor: "ramping-vus",
            stages: [
                { duration: "30s", target: 10 },
                { duration: "1m", target: 30 },
                { duration: "30s", target: 0 }
            ]
        }
    },
    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<1000"]
    }
};

export function setup() {
    const token = optional("TOKEN");
    const userId = optional("USER_ID");

    if (token && userId) {
        return { token, userId };
    }

    return loginTestUser();
}

export default function (auth) {
    const res = http.get(`${baseUrl()}/api/conversations`, {
        headers: authHeaders(auth.token, auth.userId),
        tags: {
            name: "GET /api/conversations"
        }
    });

    check(res, {
        "conversation list status is 200": (r) => r.status === 200,
        "conversation list is not 5xx": (r) => r.status < 500
    });

    sleep(1);
}