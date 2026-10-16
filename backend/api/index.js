import "dotenv/config";
import connectDB from "../config/db.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://arctrade-stocks.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

let dbPromise;
let appPromise;

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (!appPromise) appPromise = import("../app.js");
    const { default: app } = await appPromise;

    if (!dbPromise) {
      dbPromise = connectDB().catch((e) => {
        dbPromise = null;
        throw e;
      });
    }
    await dbPromise;

    return app(req, res);
  } catch (error) {
    appPromise = null;
    console.error("Backend initialization failed:", error);
    return res.status(500).json({
      success: false,
      message: "Backend initialization failed",
      error: error.message, // remove once everything works
    });
  }
}