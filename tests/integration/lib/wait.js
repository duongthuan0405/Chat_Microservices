export async function waitUntil(fn, options = {}) {
    const timeoutMs = options.timeoutMs || 15000;
    const intervalMs = options.intervalMs || 500;
    const label = options.label || "condition";

    const startedAt = Date.now();
    let lastError;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const result = await fn();
            if (result) return result;
        } catch (error) {
            lastError = error;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Timed out waiting for ${label}. Last error: ${lastError?.message || "none"}`);
}