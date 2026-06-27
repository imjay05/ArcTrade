import React, { useState, useEffect, useRef } from "react";
import { generateHistoricalCandles } from "../../utils/Chart";
import { drawChart } from "./DrawChart.js";
import "./CandlestickChart.css";

const LEGEND_ITEMS = [
  { type: "swatch", color: "#16a34a", label: "Profit (Green)" },
  { type: "swatch", color: "#C62828", label: "Loss (Red)" },
  { type: "dash", label: "Invested baseline" },
];

const CandlestickChart = ({ holdings = [], investedTotal = 0, currentTotal = 0, intervalMs = 30000 }) => {
  const canvasRef = useRef(null);
  const seededRef = useRef(false);
  const candleRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [displayTotal, setDisplayTotal] = useState(currentTotal);

  useEffect(() => {
    if (currentTotal <= 0 || seededRef.current) return;
    seededRef.current = true;
    const history = generateHistoricalCandles(currentTotal, intervalMs, 20);
    const lastClose = history[history.length - 1]?.close ?? currentTotal;

    candleRef.current = { open: lastClose, high: lastClose, low: lastClose, close: lastClose, time: Date.now() };

    setCandles(history);
    setDisplayTotal(currentTotal);
  }, [currentTotal, intervalMs]);

  useEffect(() => {
    if (currentTotal <= 0 || !seededRef.current) return;
    setDisplayTotal(currentTotal);

    if (!candleRef.current) {
      candleRef.current = { open: currentTotal, high: currentTotal, low: currentTotal, close: currentTotal, time: Date.now() };
    } else {
      candleRef.current.close = currentTotal;
      candleRef.current.high = Math.max(candleRef.current.high, currentTotal);
      candleRef.current.low = Math.min(candleRef.current.low, currentTotal);
    }

    setCandles((prev) => {
      if (!prev.length) return [{ ...candleRef.current }];
      return [...prev.slice(0, -1), { ...candleRef.current }];
    });
  }, [currentTotal]);

  useEffect(() => {
    if (currentTotal <= 0) return;
    const id = setInterval(() => {
      if (!candleRef.current) return;

      const sealed = { ...candleRef.current };
      const newOpen = sealed.close;

      candleRef.current = { open: newOpen, high: newOpen, low: newOpen, close: newOpen, time: Date.now() };

      setCandles((prev) => [...prev.slice(-49), sealed, { ...candleRef.current }]);
    }, intervalMs);

    return () => clearInterval(id);
  }, [currentTotal, intervalMs]);

  useEffect(() => {
    const currentCandle = candleRef.current;
    drawChart(canvasRef.current, { candles, currentCandle, investedTotal });
  }, [candles, investedTotal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => setCandles((c) => [...c]));
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  const pnl = displayTotal - investedTotal;
  const pnlPct = investedTotal > 0 ? (pnl / investedTotal) * 100 : 0;
  const isProfit = pnl >= 0;

  return (
    <div className="candlestick-container">
      <div className="candlestick-header">
        <div>
          <p className="candlestick-title">📊 Portfolio Performance</p>
          <p className="candlestick-subtitle">Live candlestick</p>
        </div>
        <div className="candlestick-stats">
          <div className="stat-item">
            <span className="stat-label">Invested</span>
            <span className="stat-value" style={{ color: "#555" }}>
              ₹{investedTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current</span>
            <span className={`stat-value ${isProfit ? "profit" : "loss"}`}>
              ₹{displayTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">P&amp;L</span>
            <span className={`stat-value ${isProfit ? "profit" : "loss"}`}>
              {isProfit ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}&nbsp;
              ({isProfit ? "+" : ""}{pnlPct.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="candlestick-legend">
        {LEGEND_ITEMS.map(({ type, color, label }) => (
          <div key={label} className="legend-item">
            {type === "swatch" ? <div className="legend-swatch" style={{ background: color }} /> : <div className="legend-dash" />}
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="candlestick-canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>

      {holdings.length > 0 && (
        <div className="holdings-breakdown">
          <p className="holdings-breakdown-label">Holdings breakdown</p>
          <div className="holdings-breakdown-grid">
            {holdings.map((h, i) => {
              const hp = (h.price - (h.avg || h.price)) * h.qty;
              const profit = hp >= 0;
              return (
                <div key={i} className={`holding-chip ${profit ? "profit" : "loss"}`}>
                  <p className="holding-chip-name">{h.name}</p>
                  <p className={`holding-chip-pnl ${profit ? "profit" : "loss"}`}>
                    {profit ? "+" : ""}₹{hp.toFixed(0)} ({h.qty} qty)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;