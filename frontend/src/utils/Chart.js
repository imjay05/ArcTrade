export const generateHistoricalCandles = (baseValue, intervalMs, count = 20) => {
  const now = Date.now();
  const candles = [];

  let price = baseValue * (0.985 + Math.random() * 0.03);

  for (let i = count; i >= 1; i--) {
    const open = price;
    let high = open, low = open, close = open;

    for (let t = 0; t < 8; t++) {
      const tick = close * (Math.random() * 0.008 - 0.004);
      close += tick;
      high = Math.max(high, close);
      low = Math.min(low, close);
    }

    candles.push({ open, high, low, close, time: now - i * intervalMs });
    price = close;
  }
  return candles;
};