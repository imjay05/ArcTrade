import "dotenv/config";
import app from "../app.js";
import connectDB from "../config/db.js";

let dbPromise;

export default async function handler(req, res) {
  try {
    if (!dbPromise) {
      dbPromise = connectDB().catch((error) => {
        dbPromise = null;
        throw error;
      });
    }

    await dbPromise;
    return app(req, res);
  } catch (error) {
    console.error("Backend initialization failed:", error);

    return res.status(500).json({
      success: false,
      message: "Backend initialization failed",
    });
  }
}
