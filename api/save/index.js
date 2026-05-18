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
    const method = (req.method || "GET").toUpperCase();
    const data = readData();

    if (method === "GET") {
        context.res = {
            status: 200,
            body: data,
            headers: { "Content-Type": "application/json" }
        };
        return;
    }

    if (method !== "POST") {
        context.res = { status: 405, body: "Method not allowed" };
        return;
    }

    const token = req.headers["x-admin-token"];
    if (!token || token !== data.adminToken) {
        context.res = { status: 401, body: "Unauthorized" };
        return;
    }

    const { message, meeting } = req.body || {};
    data.message = message ?? data.message ?? "";
    data.meeting = meeting ?? data.meeting ?? "";
    data.updated = new Date().toISOString();
    writeData(data);

    context.res = {
        status: 200,
        body: { saved: true },
        headers: { "Content-Type": "application/json" }
    };
};
