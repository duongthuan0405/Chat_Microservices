import http from "k6/http";
import { check, group, sleep } from "k6";
import { authHeaders, baseUrl, optional, required } from "../lib/config.js";
import { loginTestUser } from "../lib/auth.js";

export const options = {
    scenarios: {
        mixed_chat_core: {
            executor: "ramping-vus",
            stages: [
                { duration: "30s", target: 5 },
                { duration: "1m", target: 20 },
                { duration: "30s", target: 0 }
            ]
        }
    },
    thresholds: {
        http_req_failed: ["rate<0.02"],
        http_req_duration: ["p(95)<2000"]
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
    const headers = authHeaders(auth.token, auth.userId);

    group("list conversations", () => {
        const res = http.get(`${baseUrl()}/api/conversations`, {
            headers,
            tags: {
                name: "GET /api/conversations"
            }
        });

        check(res, {
            "conversation list 200": (r) => r.status === 200
        });
    });

    group("get messages", () => {
        const res = http.get(
            `${baseUrl()}/api/messages/conversation/${conversationId}?pageNumber=1&pageSize=30`,
            {
                headers,
                tags: {
                    name: "GET /api/messages/conversation/:id"
                }
            }
        );

        check(res, {
            "messages 200": (r) => r.status === 200
        });
    });

    group("send message", () => {
        const res = http.post(
            `${baseUrl()}/api/messages`,
            JSON.stringify({
                conversationId,
                content: `mixed-k6-${__VU}-${__ITER}-${Date.now()}`,
                type: "Text"
            }),
            {
                headers,
                tags: {
                    name: "POST /api/messages"
                }
            }
        );

        check(res, {
            "send message 200 or 201": (r) => r.status === 200 || r.status === 201
        });
    });

    group("get notifications", () => {
        const res = http.get(`${baseUrl()}/api/notifications?pageNumber=1&pageSize=10`, {
            headers,
            tags: {
                name: "GET /api/notifications"
            }
        });

        check(res, {
            "notifications 200": (r) => r.status === 200
        });
    });

    sleep(1);
}