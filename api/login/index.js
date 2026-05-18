const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

function readData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(raw || "{}");
    } catch (err) {
        return {};
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

module.exports = async function (context, req) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const { password } = req.body || {};

    if (!adminPassword) {
        context.res = { status: 500, body: "Server configuration missing ADMIN_PASSWORD." };
        return;
    }

    if (!password) {
        context.res = { status: 400, body: "Missing password" };
        return;
    }

    if (password !== adminPassword) {
        context.res = { status: 401, body: "Invalid password" };
        return;
    }

    const token = Buffer.from(Date.now().toString()).toString("base64");
    const data = readData();
    data.adminToken = token;
    writeData(data);

    context.res = {
        status: 200,
        body: { token },
        headers: { "Content-Type": "application/json" }
    };
};
