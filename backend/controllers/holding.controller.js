import { Holding } from "../model/holding.model.js";

export const getAllHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user.userId });
    return res.status(200).json({ success: true, data: holdings });
  } catch (err) {
    console.error("Holdings fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch holdings." });
  }
};