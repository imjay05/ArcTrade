const { HoldingsModel } = require("../model/index");

const getAllHoldings = async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({ userId: req.user.userId });
    return res.status(200).json({ success: true, data: holdings });
  } catch (err) {
    console.error("Holdings fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch holdings." });
  }
};


module.exports = { getAllHoldings };