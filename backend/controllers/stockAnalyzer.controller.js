import { getDomain } from "../data/StockUniverse.js";
import { Holding } from "../model/holding.model.js";


export const getHoldingsByDomain = async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user.userId });
    const tagged = holdings.map((h) => ({
      name: h.name,
      qty: h.qty,
      avg: h.avg,
      price: h.price,
      domain: getDomain(h.name),
    }));
    return res.status(200).json({ success: true, data: tagged });
  } catch (err) {
    console.error("Stock analyzer fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch domain breakdown." });
  }
};