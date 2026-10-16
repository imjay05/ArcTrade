import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import holdingsRoutes from "./routes/holding.route.js";
import ordersRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import stockPricesRoutes from "./routes/stockPrices.route.js";
import watchlistRoutes from "./routes/watchlist.route.js";
import stockAnalyzerRoutes from "./routes/stockAnalyzer.route.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://arctrade-stocks.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/health", (req, res) => {
  res.json({ success: true, message: "ArcTrade API is running" });
});


app.use("/api/auth", authRoutes);
app.use("/api/holdings", holdingsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/stock-prices", stockPricesRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/stock-analyzer", stockAnalyzerRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});


export default app;