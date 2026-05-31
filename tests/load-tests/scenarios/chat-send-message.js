import http from "k6/http";
import { check, sleep } from "k6";
import { authHeaders, baseUrl, optional, required } from "../lib/config.js";
import { loginTestUser } from "../lib/auth.js";

export const options = {
    scenarios: {
        chat_send_message: {
            executor: "ramping-vus",
            stages: [
                { duration: "30s", target: 5 },
                { duration: "1m", target: 15 },
                { duration: "30s", target: 0 }
            ]
        }
    },
    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<1500"]
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
    const conversationId = required("CONVERSATION_ID");

    const payload = {
        conversationId,
        content: `k6-message-${__VU}-${__ITER}-${Date.now()}`,
        type: "Text"
    };

    const res = http.post(`${baseUrl()}/api/messages`, JSON.stringify(payload), {
        headers: authHeaders(auth.token, auth.userId),
        tags: {
            name: "POST /api/messages"
        }
    });

    check(res, {
        "message sent": (r) => r.status === 200 || r.status === 201,
        "message is not 5xx": (r) => r.status < 500
    });

    sleep(1);
}