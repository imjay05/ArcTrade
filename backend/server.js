require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/DB");

const authRoutes = require("./routes/AuthRoutes");
const holdingsRoutes = require("./routes/HoldingsRoutes");
const ordersRoutes = require("./routes/OrdersRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const stockPricesRoutes = require("./routes/StockPricesRoutes");
const watchlistRoutes = require("./routes/WatchlistRoutes");
const stockAnalyzerRoutes = require("./routes/StockAnalyzerRoutes");

const PORT = process.env.PORT || 3002;

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use(bodyParser.json());
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ArcTrade API running on http://localhost:${PORT}`);
  });
});