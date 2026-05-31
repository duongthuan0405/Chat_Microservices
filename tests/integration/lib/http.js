import { env } from "./env.js";

function buildUrl(path) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.baseUrl}${normalizedPath}`;
}

export async function request(method, path, options = {}) {
    const headers = {
        Accept: "application/json",
        ...(options.headers || {})
    };

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    if (options.userId) {
        headers["X-User-Id"] = options.userId;
    }

    let body;
    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(options.body);
    }

    const response = await fetch(buildUrl(path), {
        method,
        headers,
        body
    });

    const text = await response.text();

    let parsedBody = null;
    if (text) {
        try {
            parsedBody = JSON.parse(text);
        } catch {
            parsedBody = text;
        }
    }

    return {
        status: response.status,
        headers: response.headers,
        body: parsedBody
    };
}

export function get(path, options) {
    return request("GET", path, options);
}

export function post(path, body, options = {}) {
    return request("POST", path, { ...options, body });
}

export function put(path, body, options = {}) {
    return request("PUT", path, { ...options, body });
}

export function patch(path, body, options = {}) {
    return request("PATCH", path, { ...options, body });
}

export function del(path, options = {}) {
    return request("DELETE", path, options);
}