import React from "react";
import useHoldings from "../../hooks/useHoldings";
import useLivePriceTick from "../../hooks/useLivePriceTick";
import "./MyStocks.css";

const MyStocks = () => {
  const { holdings, liveHoldings, setLiveHoldings, holdingsLoading } = useHoldings();
  useLivePriceTick(setLiveHoldings, liveHoldings.length);

  const rows = liveHoldings.length ? liveHoldings : holdings;

  return (
    <div className="my-stocks-card">
      <div className="my-stocks-header">
        <h4>My Trades</h4>
        <span className="my-stocks-count">
          {holdingsLoading ? "…" : rows.length}
        </span>
      </div>

      {holdingsLoading ? (
        <p className="my-stocks-empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="my-stocks-empty">No stocks bought yet.</p>
      ) : (
        <ul className="my-stocks-list">
          {rows.map((h) => {
            const avg = h.avg ?? h.price;
            const ltp = h.price;
            const isUp = ltp >= avg;
            return (
              <li key={h.name}>
                <span className="my-stocks-symbol">{h.name}</span>
                <span className="my-stocks-qty">Qty {h.qty}</span>
                <span className={`my-stocks-ltp ${isUp ? "up" : "down"}`}>
                  ₹{Number(ltp).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyStocks;