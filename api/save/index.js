module.exports = async function (context, req) {
    const token = req.headers["x-admin-token"];
    const validToken = process.env.CURRENT_ADMIN_TOKEN;

    if (!token || token !== validToken) {
        context.res = { status: 401, body: "Unauthorized" };
        return;
    }

    const { message, meeting } = req.body;

    const fs = require("fs");
    const path = require("path");

    const filePath = path.join(__dirname, "data.json");
    const data = { message, meeting, updated: new Date().toISOString() };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    context.res = { status: 200, body: "Saved" };
};
