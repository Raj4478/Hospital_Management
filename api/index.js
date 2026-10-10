// Vercel serverless entry: the Express API is served from the same domain as the app,
// so the frontend can call /api/v1/... with no CORS or cookie setup.
import app from "../Server/app.js";

export default app;
