import "dotenv/config"; 
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3002;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ArcTrade API running on http://localhost:${PORT}`);
  });
});