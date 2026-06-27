const STOCK_UNIVERSE = {
  "IT & Technology": [
    "TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "MPHASIS", "COFORGE",
  ], 
  "Banking & Finance": [
    "HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK", "BAJFINANCE", "INDUSINDBK",
  ], 
  "Pharma & Healthcare": [
    "SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "APOLLOHOSP", "LUPIN", "AUROPHARMA",
  ], 
  "FMCG & Consumer": [
    "HUL", "ITC", "NESTLEIND", "BRITANNIA", "DABUR", "TATACONSUM",
  ], 
  "Auto & EV": [
  "MARUTI", "TVSMOTOR", "M&M", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO",
  ],
  "Oil & Gas / Energy": [
    "RELIANCE", "ONGC", "NTPC", "POWERGRID", "BPCL", "GAIL",
  ], 
  "Metals & Mining": [
    "TATASTEEL", "JSWSTEEL", "HINDALCO", "COALINDIA", "VEDL",
  ], 
  "Infrastructure": [
    "LT", "ULTRACEMCO", "ADANIENT", "DLF", "GRASIM", "ACC",
  ], 
  "Defence & Aerospace": [
    "HAL", "BEL", "BHEL", "MIDHANI", "PARAS"
  ],
};

const SYMBOL_TO_DOMAIN = {};
Object.entries(STOCK_UNIVERSE).forEach(([domain, symbols]) => {
  symbols.forEach((sym) => { SYMBOL_TO_DOMAIN[sym] = domain; });
});

const ALL_SYMBOLS = Object.values(STOCK_UNIVERSE).flat(); 

const isValidSymbol = (sym) => ALL_SYMBOLS.includes(sym.toUpperCase());
const getDomain = (sym) => SYMBOL_TO_DOMAIN[sym.toUpperCase()] || "Other";

module.exports = { STOCK_UNIVERSE, SYMBOL_TO_DOMAIN, ALL_SYMBOLS, isValidSymbol, getDomain };