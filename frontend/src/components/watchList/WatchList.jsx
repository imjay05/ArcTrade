import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useStockUniverse } from "../../hooks/useStockUniverse";
import { useStockPrices } from "../../hooks/useStockPrices";
import WatchListItem from "./WatchListItem";
import "./WatchList.css";
import "./WatchListAddStock.css";

const MAX_STOCKS = 7;

const WatchList = () => {
  const { user, addCustomStock, removeCustomStock } = useAuth();
  const { allSymbols, customSymbolSet } = useStockUniverse();
  const { prices } = useStockPrices(allSymbols);

  const [query, setQuery] = useState("");
  const [symbol, setSymbol] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingSymbol, setRemovingSymbol] = useState(null);

  const customStocks = user?.customStocks || [];
  const atLimit = customStocks.length >= MAX_STOCKS;

  const handleAdd = async () => {
    if (!symbol.trim()) return toast.error("Enter a stock symbol.");
    if (atLimit) return toast.error(`Limit reached — max ${MAX_STOCKS} stocks.`);

    setAdding(true);
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
      setAdding(false);
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

  const enrich = (sym) => {
    const live = prices[sym];
    return {
      name: sym,
      price: live?.price ?? "—",
      percent: live ? `${live.percent >= 0 ? "+" : ""}${live.percent.toFixed(2)}%` : "—",
      isDown: live?.isDown ?? false,
      hasData: !!live,
      isCustom: customSymbolSet.has(sym),
    };
  };

  const displayList = useMemo(() => {
    const q = query.trim().toUpperCase();
    const base = q ? allSymbols.filter((s) => s.includes(q)) : [...allSymbols].sort();
    return base.map(enrich);
  }, [query, allSymbols, prices, customSymbolSet]);

  return (
    <div className="watchlist-container">
      <div className="wl-add-card">
        <div className="wl-add-header">
          <h4>My Stocks</h4>
          <span className={`wl-add-count ${atLimit ? "at-limit" : ""}`}>
            {customStocks.length} / {MAX_STOCKS}
          </span>
        </div>

        <div className="wl-add-row">
          <input
            type="text"
            placeholder="e.g. ZOMATO"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={atLimit || adding}
          />
          <button onClick={handleAdd} disabled={atLimit || adding}>
            {adding ? "Adding..." : "Add"}
          </button>
        </div>

        {atLimit && (
          <p className="wl-add-limit-note">
            You've reached the {MAX_STOCKS}-stock limit. Remove one to add another.
          </p>
        )}

        {customStocks.length > 0 && (
          <ul className="wl-add-list">
            {customStocks.map((s) => (
              <li key={s.symbol}>
                <span className="wl-add-symbol">{s.symbol}</span>
                <span className="wl-add-domain">{s.domain}</span>
                <button
                  className="wl-add-remove"
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

      <div className="wl-search-wrap">
        <span className="wl-search-icon">🔍</span>
        <input
          className="wl-search"
          type="text"
          placeholder="Search NSE symbol…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}/>
        {query && <button className="wl-search-clear" onClick={() => setQuery("")}>✕</button>}
      </div>

      <div className="list-scroll">
        <ul className="list">
          {displayList.length === 0
            ? <li className="wl-empty">No stocks match "{query}"</li>
            : displayList.map((stock, i) => (
                <WatchListItem key={i} stock={stock} />
              ))
          }
        </ul>
      </div>
    </div>
  );
};

export default WatchList;