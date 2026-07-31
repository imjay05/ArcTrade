import React, { useMemo, useState } from "react";
import { useStockUniverse } from "../../hooks/useStockUniverse";
import { useStockPrices } from "../../hooks/useStockPrices";
import WatchListItem from "./WatchListItem";
import "./WatchList.css";

const WatchList = () => {
  const { allSymbols, customSymbolSet } = useStockUniverse();
  const { prices } = useStockPrices(allSymbols);

  const [query, setQuery] = useState("");

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