export function required(name) {
    const value = __ENV[name];

    if (!value || String(value).trim() === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return String(value).trim();
}

export function optional(name, fallback = "") {
    const value = __ENV[name];

    if (!value || String(value).trim() === "") {
        return fallback;
    }

    return String(value).trim();
}

export function baseUrl() {
    return required("BASE_URL").replace(/\/+$/, "");
}

export function authLoginPath() {
    return optional("AUTH_LOGIN_PATH", "/api/auth/login");
}

export function authHeaders(token, userId) {
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
        headers["X-User-Id"] = userId;
        headers.userId = userId;
    }

    return headers;
}