const { STOCK_UNIVERSE, ALL_SYMBOLS, isValidSymbol, getDomain } = require("../data/StockUniverse");
const { UserModel } = require("../model/index");
const { fetchQuote, toYahooSymbol } = require("./StockPricesController");

const MAX_CUSTOM_STOCKS = 7;


const getUniverse = async (req, res) => {
  return res.json({ success: true, universe: STOCK_UNIVERSE, allSymbols: ALL_SYMBOLS });
};


const addCustomStock = async (req, res) => {
  try {
    let { symbol } = req.body;

    if (!symbol || typeof symbol !== "string" || !symbol.trim()) {
      return res.status(400).json({ success: false, message: "Please enter a stock symbol." });
    }
    symbol = symbol.trim().toUpperCase();

    if (isValidSymbol(symbol)) {
      return res.status(400).json({
        success: false,
        message: `${symbol} is already in the default watchlist.`,
      });
    }

    const user = await UserModel.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.customStocks.some((s) => s.symbol === symbol)) {
      return res.status(400).json({
        success: false,
        message: `${symbol} is already in your list.`,
      });
    }

    if (user.customStocks.length >= MAX_CUSTOM_STOCKS) {
      return res.status(400).json({
        success: false,
        message: `Limit reached — you can add up to ${MAX_CUSTOM_STOCKS} stocks. Remove one first.`,
      });
    }

    try {
      await fetchQuote(toYahooSymbol(symbol));
    } catch {
      return res.status(400).json({
        success: false,
        message: `"${symbol}" doesn't look like a valid NSE stock symbol.`,
      });
    }

    const domain = getDomain(symbol);

    user.customStocks.push({ symbol, domain, addedAt: new Date() });
    await user.save();

    return res.status(201).json({
      success: true,
      message: `${symbol} added to your watchlist.`,
      customStocks: user.customStocks,
    });
  } catch (err) {
    console.error("Add custom stock error:", err);
    return res.status(500).json({ success: false, message: "Failed to add stock." });
  }
};


const removeCustomStock = async (req, res) => {
  try {
    const symbol = req.params.symbol?.trim().toUpperCase();

    const user = await UserModel.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const before = user.customStocks.length;
    user.customStocks = user.customStocks.filter((s) => s.symbol !== symbol);

    if (user.customStocks.length === before) {
      return res.status(404).json({ success: false, message: "Stock not found in your list." });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `${symbol} removed.`,
      customStocks: user.customStocks,
    });
  } catch (err) {
    console.error("Remove custom stock error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove stock." });
  }
};


module.exports = { getUniverse, addCustomStock, removeCustomStock };