export function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertStatus(response, allowedStatuses, label) {
    if (!allowedStatuses.includes(response.status)) {
        throw new Error(
            `${label} failed. Expected ${allowedStatuses.join(", ")}, got ${response.status}. Body: ${JSON.stringify(response.body)}`
        );
    }
}

export function assertDefined(value, message) {
    if (value === undefined || value === null || value === "") {
        throw new Error(message);
    }
}