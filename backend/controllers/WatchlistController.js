const { STOCK_UNIVERSE, ALL_SYMBOLS } = require("../data/StockUniverse");


const getUniverse = async (req, res) => {
  return res.json({ success: true, universe: STOCK_UNIVERSE, allSymbols: ALL_SYMBOLS });
};


module.exports = { getUniverse };