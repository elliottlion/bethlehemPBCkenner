const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

module.exports = async function (context, req) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const { password } = req.body;

    if (!password) {
        context.res = { status: 400, body: "Missing password" };
        return;
    }

    if (password !== adminPassword) {
        context.res = { status: 401, body: "Invalid password" };
        return;
    }

    // Create a simple session token
    const token = Buffer.from(Date.now().toString()).toString("base64");

    // Store token in environment variable
    process.env.CURRENT_ADMIN_TOKEN = token;

    context.res = {
        status: 200,
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" }
    };
};
