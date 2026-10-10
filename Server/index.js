import { env, assertEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

try {
    assertEnv();
    const conn = await connectDB();
    console.log(`MongoDB connected: ${conn.host}/${conn.name}`);
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

const server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
