const PAD = { top: 20, right: 60, bottom: 40, left: 10 };

const COLORS = {
  profit: "#16a34a",
  loss:   "#C62828",
  grid:   "#f0f0f0",
  label:  "#bbb",
  stale:  "#aaa",
};

export const drawChart = (canvas, { candles, currentCandle, investedTotal }) => {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth, H = canvas.offsetHeight;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const allCandles = currentCandle ? [...candles, currentCandle] : candles;

  if (allCandles.length === 0) {
    ctx.fillStyle = COLORS.stale;
    ctx.font = "12px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Waiting for data...", W / 2, H / 2);
    return;
  }

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allPrices = allCandles.flatMap((c) => [c.high, c.low]);
  let minP = Math.min(...allPrices), maxP = Math.max(...allPrices);
  const pad = (maxP - minP) * 0.1 || maxP * 0.02;
  minP -= pad; maxP += pad;

  const range = maxP - minP;
  const toY = (p) => PAD.top + chartH - ((p - minP) / range) * chartH;

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = PAD.top + (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(W - PAD.right, y);
    ctx.stroke();

    const price = maxP - (range / 5) * i;
    ctx.fillStyle = COLORS.label;
    ctx.font = "10px -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("₹" + price.toLocaleString("en-IN", { maximumFractionDigits: 0 }), W - PAD.right + 4, y + 3);
  }

  if (investedTotal > 0 && investedTotal >= minP && investedTotal <= maxP) {
    const baseY = toY(investedTotal);

    ctx.strokeStyle = COLORS.stale;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD.left, baseY);
    ctx.lineTo(W - PAD.right, baseY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.stale;
    ctx.font = "9px -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Invested", PAD.left + 2, baseY - 3);
  }

  const spacing = chartW / allCandles.length;
  const candleW = Math.max(4, Math.min(16, spacing * 0.6));

  allCandles.forEach((candle, i) => {
    const x = PAD.left + spacing * i + spacing / 2;
    const color = candle.close >= candle.open ? COLORS.profit : COLORS.loss;
    const openY = toY(candle.open), closeY = toY(candle.close);
    const bodyTop = Math.min(openY, closeY);
    const bodyH = Math.max(1, Math.abs(closeY - openY));

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, toY(candle.high));
    ctx.lineTo(x, toY(candle.low));
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
  });

  if (currentCandle) {
    const curY = toY(currentCandle.close);
    const color = currentCandle.close >= investedTotal ? COLORS.profit : COLORS.loss;

    ctx.fillStyle = color;
    ctx.fillRect(W - PAD.right + 2, curY - 8, PAD.right - 4, 16);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "₹" + currentCandle.close.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      W - PAD.right + (PAD.right - 4) / 2 + 2,
      curY + 3
    );
  }

  ctx.fillStyle = COLORS.label;
  ctx.font = "9px -apple-system, sans-serif";
  ctx.textAlign = "center";

  const labelStep = Math.max(1, Math.floor(allCandles.length / 6));
  allCandles.forEach((c, i) => {
    if (i % labelStep === 0 || i === allCandles.length - 1) {
      const x = PAD.left + spacing * i + spacing / 2;
      const t = new Date(c.time);
      ctx.fillText(
        t.getHours().toString().padStart(2, "0") + ":" + t.getMinutes().toString().padStart(2, "0"),
        x, H - PAD.bottom + 14
      );
    }
  });
};