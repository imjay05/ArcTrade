const axios = require("axios");

const priceCache = {};
const CACHE_TTL = 15 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


const toYahooSymbol = (sym) => {
  const s = sym.trim().toUpperCase();
  if (s === "M&M" || s === "M%26M") return "M&M.NS";
  if (s === "L&T" || s === "L%26T" || s === "LT") return "LT.NS";
  if (s === "HUL") return "HINDUNILVR.NS";
  if (s === "BAJAJ-AUTO") return "BAJAJ-AUTO.NS";                
  if (s === "DLF") return "DLF.NS";
  if (s.endsWith(".NS") || s.endsWith(".BO")) return s;
  return `${s}.NS`;
};


const fromYahooSymbol = (yahooSym) => {
  if (yahooSym === "HINDUNILVR.NS") return "HUL";
  if (yahooSym === "M&M.NS") return "M&M"; 
  if (yahooSym === "DLF.NS") return "DLF";
  return yahooSym.replace(/\.(NS|BO)$/, "");
};


async function fetchQuote(yahooSymbol) {
  const cleanSymbol = decodeURIComponent(yahooSymbol);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanSymbol)}?interval=1d&range=1d`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      timeout: 8000,
    });

    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice == null)
      throw new Error(`No data for ${cleanSymbol}`);

    const price = parseFloat(meta.regularMarketPrice.toFixed(2));
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = parseFloat((price - prev).toFixed(2));
    const percent = parseFloat(((change / prev) * 100).toFixed(2));

    return {
      price, change, percent,
      isDown: change < 0,
      high: meta.regularMarketDayHigh ?? null,
      low: meta.regularMarketDayLow ?? null,
      open: meta.regularMarketOpen ?? null,
      prevClose: prev,
      volume: meta.regularMarketVolume ?? null,
      name: meta.shortName || meta.longName || null,
    };
  } catch (err) {
    throw err;
  }
}


const getStockPrices = async (req, res) => {
  const { symbols } = req.query;
  if (!symbols)
    return res.status(400).json({ success: false, message: "symbols param required" });

  const rawList = decodeURIComponent(symbols).split(",").map(s => s.trim()).filter(Boolean);
  const results = [];
  const errors = [];

  for (const raw of rawList) {
    const yahooSym = toYahooSymbol(raw);
    const ourSymbol = fromYahooSymbol(yahooSym);

    const cached = priceCache[ourSymbol];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      results.push({ symbol: ourSymbol, ...cached, fromCache: true });
      continue;
    }

    try {
      const quote = await fetchQuote(yahooSym);
      priceCache[ourSymbol] = { ...quote, fetchedAt: Date.now() };
      results.push({ symbol: ourSymbol, ...quote });
    } catch (err) {
      console.warn(`[Yahoo] ${yahooSym}:`, err.message);
      errors.push(`${ourSymbol}: ${err.message}`);
      if (cached) results.push({ symbol: ourSymbol, ...cached, stale: true });
    }

    await sleep(200);
  }

  const orderMap = {};
  rawList.forEach((raw, i) => { orderMap[fromYahooSymbol(toYahooSymbol(raw))] = i; });
  results.sort((a, b) => (orderMap[a.symbol] ?? 99) - (orderMap[b.symbol] ?? 99));

  return res.status(200).json({
    success: true,
    data: results,
    ...(errors.length ? { errors } : {}),
  });
};

const PARALLEL_SIZE = 8;
const BATCH_DELAY = 300;


const getBulkQuotes = async (req, res) => {
  const { symbols } = req.query;
  if (!symbols)
    return res.status(400).json({ success: false, message: "symbols required" });

  const rawList = decodeURIComponent(symbols).split(",").map(s => s.trim()).filter(Boolean);

  const instant = [];
  const toFetch = [];

  for (const raw of rawList) {
    const ourSymbol = fromYahooSymbol(toYahooSymbol(raw));
    const cached = priceCache[ourSymbol];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      instant.push({ symbol: ourSymbol, ...cached, fromCache: true });
    } else {
      toFetch.push(raw);
    }
  }

  const fetched = [];

  for (let i = 0; i < toFetch.length; i += PARALLEL_SIZE) {
    const batch = toFetch.slice(i, i + PARALLEL_SIZE);

    const settled = await Promise.allSettled(
      batch.map(async (raw) => {
        const yahooSym = toYahooSymbol(raw);
        const ourSymbol = fromYahooSymbol(yahooSym);
        try {
          const quote = await fetchQuote(yahooSym);
          priceCache[ourSymbol] = { ...quote, fetchedAt: Date.now() };
          return { symbol: ourSymbol, ...quote };
        } catch (err) {
          console.warn(`[Yahoo] ${yahooSym}:`, err.message);
          const stale = priceCache[ourSymbol];
          return stale ? { symbol: ourSymbol, ...stale, stale: true } : null;
        }
      })
    );

    settled.forEach((r) => {
      if (r.status === "fulfilled" && r.value) fetched.push(r.value);
    });

    if (i + PARALLEL_SIZE < toFetch.length) await sleep(BATCH_DELAY);
  }

  const all = [...instant, ...fetched];
  const orderMap = {};
  rawList.forEach((raw, i) => { orderMap[fromYahooSymbol(toYahooSymbol(raw))] = i; });
  all.sort((a, b) => (orderMap[a.symbol] ?? 99) - (orderMap[b.symbol] ?? 99));

  return res.status(200).json({ success: true, data: all });
};


module.exports = { getStockPrices, getBulkQuotes };