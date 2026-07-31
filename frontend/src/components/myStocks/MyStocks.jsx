import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./MyStocks.css";

const MAX_STOCKS = 7;

const MyStocks = () => {
  const { user, addCustomStock, removeCustomStock } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingSymbol, setRemovingSymbol] = useState(null);

  const customStocks = user?.customStocks || [];
  const atLimit = customStocks.length >= MAX_STOCKS;

  const handleAdd = async () => {
    if (!symbol.trim()) return toast.error("Enter a stock symbol.");
    if (atLimit) return toast.error(`Limit reached — max ${MAX_STOCKS} stocks.`);

    setLoading(true);
    try {
      const res = await addCustomStock(symbol.trim().toUpperCase());
      if (res.success) {
        toast.success(res.message);
        setSymbol("");
      } else {
        toast.error(res.message || "Failed to add stock.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add stock.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (sym) => {
    setRemovingSymbol(sym);
    try {
      const res = await removeCustomStock(sym);
      if (res.success) toast.success(res.message);
      else toast.error(res.message || "Failed to remove stock.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove stock.");
    } finally {
      setRemovingSymbol(null);
    }
  };

  return (
    <div className="my-stocks-card">
      <div className="my-stocks-header">
        <h4>My Stocks</h4>
        <span className={`my-stocks-count ${atLimit ? "at-limit" : ""}`}>
          {customStocks.length} / {MAX_STOCKS}
        </span>
      </div>

      <div className="my-stocks-add-row">
        <input
          type="text"
          placeholder="e.g. ZOMATO"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={atLimit || loading}
        />
        <button onClick={handleAdd} disabled={atLimit || loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {atLimit && (
        <p className="my-stocks-limit-note">
          You've reached the 7-stock limit. Remove one to add another.
        </p>
      )}

      {customStocks.length > 0 && (
        <ul className="my-stocks-list">
          {customStocks.map((s) => (
            <li key={s.symbol}>
              <span className="my-stocks-symbol">{s.symbol}</span>
              <span className="my-stocks-domain">{s.domain}</span>
              <button
                className="my-stocks-remove"
                onClick={() => handleRemove(s.symbol)}
                disabled={removingSymbol === s.symbol}
                title="Remove">
                {removingSymbol === s.symbol ? "…" : "✕"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default MyStocks;