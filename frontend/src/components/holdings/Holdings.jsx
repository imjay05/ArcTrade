import React, { useState, useEffect } from "react";
import axios from "axios";
import CandlestickChart from "../candlestickChart/CandlestickChart";
import { useStockPrices } from "../../hooks/useStockPrices";
import "./Holdings.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [liveHoldings, setLiveHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const symbols = allHoldings.map((h) => h.name);
  const { prices } = useStockPrices(symbols);

  useEffect(() => {
    axios
      .get(`${API}/api/holdings`)
      .then((res) => {
        const data = res.data.data || res.data;
        const arr = Array.isArray(data) ? data : [];
        setAllHoldings(arr);
        setLiveHoldings(arr.map((h) => ({ ...h })));
      })
      .catch(() => { setAllHoldings([]); setLiveHoldings([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!allHoldings.length || !Object.keys(prices).length) return;
    setLiveHoldings(
      allHoldings.map((h) => ({ ...h, price: prices[h.name]?.price ?? h.price }))
    );
  }, [prices, allHoldings]);

  useEffect(() => {
    if (liveHoldings.length === 0) return;
    if (Object.keys(prices).length > 0) return;
    const interval = setInterval(() => {
      setLiveHoldings((prev) =>
        prev.map((h) => ({ ...h, price: +(h.price * (1 + (Math.random() * 0.004 - 0.002))).toFixed(2) }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [liveHoldings.length, prices]);

  const investedTotal = allHoldings.reduce((sum, h) => sum + (h.avg || h.price) * h.qty, 0);
  const currentTotal = liveHoldings.reduce((sum, h) => sum + h.price * h.qty, 0);
  const totalPnl = currentTotal - investedTotal;
  const totalPnlPct = investedTotal > 0 ? (totalPnl / investedTotal) * 100 : 0;
  const isProfit = totalPnl >= 0;

  if (loading) {
    return <p style={{ padding: "20px", color: "#aaa" }}>Loading holdings...</p>;
  }

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&amp;L</th>
              <th>Net chg.</th>
            </tr>
          </thead>
          <tbody>
            {liveHoldings.length === 0 ? (
              <tr><td colSpan={7} className="holdings-empty">No holdings found. Start investing!</td></tr>
            ) : (
              liveHoldings.map((stock, index) => {
                const avgCost = stock.avg || stock.price;
                const curValue = stock.price * stock.qty;
                const invValue = avgCost * stock.qty;
                const pnl = curValue - invValue;
                const pnlPct = invValue > 0 ? (pnl / invValue) * 100 : 0;
                const profit = pnl >= 0;
                const cellClass = profit ? "holdings-cell-profit" : "holdings-cell-loss";

                return (
                  <tr key={index}>
                    <td style={{ fontWeight: 600 }}>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>{avgCost.toFixed(2)}</td>
                    <td className={cellClass}>{stock.price.toFixed(2)}</td>
                    <td className={cellClass}>{curValue.toFixed(2)}</td>
                    <td className={cellClass}>{profit ? "+" : ""}{pnl.toFixed(2)}</td>
                    <td className={cellClass}>{profit ? "+" : ""}{pnlPct.toFixed(2)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>₹{(investedTotal / 1000).toFixed(2)}<span>k</span></h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5 style={{ color: isProfit ? "#16a34a" : "#C62828" }}>
            ₹{(currentTotal / 1000).toFixed(2)}<span>k</span>
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 style={{ color: isProfit ? "#16a34a" : "#C62828" }}>
            {isProfit ? "+" : ""}₹{totalPnl.toFixed(2)}&nbsp;
            <span>({isProfit ? "+" : ""}{totalPnlPct.toFixed(2)}%)</span>
          </h5>
          <p>P&amp;L</p>
        </div>
      </div>

      {liveHoldings.length > 0 && (
        <CandlestickChart
          holdings={liveHoldings}
          investedTotal={investedTotal}
          currentTotal={currentTotal}
          intervalMs={30000}
        />
      )}
    </>
  );
};

export default Holdings;