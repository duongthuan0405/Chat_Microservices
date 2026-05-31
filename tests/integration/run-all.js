const specs = [
    "./specs/01-auth-gateway.spec.js",
    "./specs/02-conversation-permission.spec.js",
    "./specs/03-friendship-flow.spec.js",
    "./specs/04-chat-message-flow.spec.js",
    "./specs/05-notification-history.spec.js"
];

for (const spec of specs) {
    console.log(`\n===== ${spec} =====`);
    await import(spec);
}

console.log("\nALL INTEGRATION TESTS PASSED");