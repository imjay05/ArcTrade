import React, { useState, useMemo } from "react";
import { stocksByDomain } from "../../data/Data";
import { useStockPrices } from "../../hooks/useStockPrices";
import WatchListItem from "./WatchListItem";
import "./WatchList.css";

const WatchList = () => {
  const allSymbols = useMemo(() => Object.values(stocksByDomain).flat(), []);
  const { prices } = useStockPrices(allSymbols);

  const [openDomain, setOpenDomain] = useState(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("flat"); // "flat" | "domain"

  const enrich = (sym) => {
    const live = prices[sym];
    return {
      name: sym,
      price: live?.price ?? "—",
      percent: live ? `${live.percent >= 0 ? "+" : ""}${live.percent.toFixed(2)}%` : "—",
      isDown: live?.isDown ?? false,
      hasData: !!live,
    };
  };

  const domainSentiment = useMemo(() => {
    const result = {};
    Object.keys(stocksByDomain).forEach((domain) => {
      let up = 0, down = 0;
      stocksByDomain[domain].forEach((s) => {
        const live = prices[s];
        if (!live) return;
        live.isDown ? down++ : up++;
      });
      const total = up + down || 1;
      result[domain] = { upPct: (up / total) * 100, downPct: (down / total) * 100, up, down };
    });
    return result;
  }, [prices]);

  const searchResults = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [];
    return allSymbols.filter((s) => s.includes(q)).map(enrich);
  }, [query, allSymbols, prices]);

  const flatList = useMemo(() => {
    return [...allSymbols].sort().map(enrich);
  }, [allSymbols, prices]);

  const isSearching = query.trim().length > 0;

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
          spellCheck={false}
        />
        {query && <button className="wl-search-clear" onClick={() => setQuery("")}>✕</button>}
      </div>

      {!isSearching && (
        <div className="wl-view-toggle">
          <button
            className={viewMode === "flat" ? "active" : ""}
            onClick={() => setViewMode("flat")}>
            All Stocks
          </button>
          <button
            className={viewMode === "domain" ? "active" : ""}
            onClick={() => setViewMode("domain")}>
            By Domain
          </button>
        </div>
      )}

      <div className="list-scroll">
        {isSearching ? (
          <ul className="list">
            {searchResults.length === 0
              ? <li className="wl-empty">No stocks match "{query}"</li>
              : searchResults.map((stock, i) => (
                  <WatchListItem key={i} stock={stock} />
                ))
            }
          </ul>
        ) : viewMode === "flat" ? (
          <ul className="list">
            {flatList.map((stock, i) => (
              <WatchListItem key={i} stock={stock} />
            ))}
          </ul>
        ) : (
          <ul className="domain-list">
            {Object.keys(stocksByDomain).map((domain) => {
              const stocks = stocksByDomain[domain];
              const sent = domainSentiment[domain] || { upPct: 50, downPct: 50, up: 0, down: 0 };
              const isOpen = openDomain === domain;

              return (
                <li key={domain} className="domain-item">
                  <div className="domain-header" onClick={() => setOpenDomain(isOpen ? null : domain)}>
                    <div className="domain-header-top">
                      <span className="domain-name">{domain}</span>
                      <span className="domain-count">{stocks.length} stocks</span>
                      <span className={`domain-chevron ${isOpen ? "open" : ""}`}>▾</span>
                    </div>
                    <div className="domain-sentiment-bar">
                      <div className="dsb-up" style={{ width: `${sent.upPct}%` }} />
                      <div className="dsb-down" style={{ width: `${sent.downPct}%` }} />
                    </div>
                    <div className="domain-sentiment-labels">
                      <span className="dsl-up">▲ {sent.up}</span>
                      <span className="dsl-down">{sent.down} ▼</span>
                    </div>
                  </div>

                  {isOpen && (
                    <ul className="domain-stocks">
                      {stocks.map((sym, i) => (
                        <WatchListItem key={i} stock={enrich(sym)} />
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WatchList;