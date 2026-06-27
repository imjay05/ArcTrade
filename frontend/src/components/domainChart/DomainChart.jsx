import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { stocksByDomain } from "../../data/Data";
import { useStockPrices } from "../../hooks/useStockPrices";
import "./DomainChart.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";
const BAR_MAX_HEIGHT = 120;

const DomainChart = () => {
  const [holdings, setHoldings] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/stock-analyzer`)
      .then((res) => { if (res.data.success) setHoldings(res.data.data); })
      .catch(() => setHoldings([]));
  }, []);

  const allSymbols = useMemo(() => Object.values(stocksByDomain).flat(), []);
  const { prices } = useStockPrices(allSymbols);

  const holdingMap = useMemo(() => {
    const map = {};
    holdings.forEach((h) => { map[h.name] = h; });
    return map;
  }, [holdings]);

  const domainStats = useMemo(() => {
    return Object.entries(stocksByDomain).map(([domain, symbols]) => {
      let domainChangePct = 0;
      let priceCount = 0;
      symbols.forEach((sym) => {
        const p = prices[sym];
        if (p) {
          domainChangePct += p.percent ?? 0;
          priceCount++;
        }
      });
      const avgChangePct = priceCount > 0 ? domainChangePct / priceCount : 0;

      const heldStocks = symbols
        .filter((sym) => holdingMap[sym])
        .map((sym) => {
          const h = holdingMap[sym];
          return {
            name: sym,
            qty: h.qty,
            avg: h.avg,
            livePrice: prices[sym]?.price ?? h.price,
          };
        });

      const heldPnl = heldStocks.reduce((sum, s) => sum + (s.livePrice - s.avg) * s.qty, 0);
      const heldInvested = heldStocks.reduce((sum, s) => sum + s.avg * s.qty, 0);
      const heldPnlPct = heldInvested > 0 ? (heldPnl / heldInvested) * 100 : 0;

      return {
        domain,
        symbols,
        avgChangePct,
        isUp: avgChangePct >= 0,
        priceCount,
        heldStocks,
        heldPnl,
        heldPnlPct,
        hasHoldings: heldStocks.length > 0,
      };
    });
  }, [holdingMap, prices]);

  const maxAbsChange = useMemo(
    () => Math.max(...domainStats.map((d) => Math.abs(d.avgChangePct)), 0.01),
    [domainStats]
  );

  const selected = selectedDomain
    ? domainStats.find((d) => d.domain === selectedDomain)
    : null;

  const hasAnyPrices = Object.keys(prices).length > 0;

  return (
    <div className="dc-container">
      <h3 className="dc-title">📊 Domain Overview</h3>
      <p className="dc-subtitle">
        Live intraday movement across all sectors. Click a bar for details.
      </p>

      <div className="dc-chart-wrap">
        {!hasAnyPrices ? (
          <div className="dc-loading">Loading live prices…</div>
        ) : (
          <div className="dc-chart">
            {domainStats.map(({ domain, avgChangePct, isUp, priceCount, hasHoldings }) => {
              const barH = priceCount > 0
                ? Math.max(6, Math.round((Math.abs(avgChangePct) / maxAbsChange) * BAR_MAX_HEIGHT))
                : 4;
              const isSelected = selectedDomain === domain;

              return (
                <div
                  key={domain}
                  className={`dc-bar-col${isSelected ? " dc-bar-col--selected" : ""}${hasHoldings ? " dc-bar-col--held" : ""}`}
                  onClick={() => setSelectedDomain(domain === selectedDomain ? null : domain)}
                  title={`${domain}: ${isUp ? "+" : ""}${avgChangePct.toFixed(2)}% today`}>

                  <div className="dc-half dc-half--top">
                    {isUp ? (
                      <>
                        <span className="dc-pct dc-pct--profit">+{avgChangePct.toFixed(2)}%</span>
                        <div className="dc-bar dc-bar--profit" style={{ height: barH }} />
                      </>
                    ) : (
                      <div className="dc-bar-spacer" />
                    )}
                  </div>

                  <div className="dc-zero-tick" />

                  <div className="dc-half dc-half--bottom">
                    {!isUp ? (
                      <>
                        <div className="dc-bar dc-bar--loss" style={{ height: barH }} />
                        <span className="dc-pct dc-pct--loss">{avgChangePct.toFixed(2)}%</span>
                      </>
                    ) : (
                      <div className="dc-bar-spacer" />
                    )}
                  </div>

                  <div className="dc-bar-meta">
                    <div className="dc-bar-name">{domain}</div>
                    <div className="dc-bar-sub">
                      {hasHoldings && <span className="dc-held-dot" title="You hold stocks here" />}
                      <span className={isUp ? "dc-up" : "dc-dn"}>
                        {priceCount > 0 ? `${priceCount} stocks` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="dc-table-wrap">
          <div className="dc-table-header">
            <h4 className="dc-table-title">
              {selected.domain}
              <span className={`dc-domain-badge ${selected.isUp ? "dc-profit" : "dc-loss"}`}>
                {selected.isUp ? "+" : ""}{selected.avgChangePct.toFixed(2)}% today
              </span>
              {selected.hasHoldings && (
                <span className={`dc-table-avg ${selected.heldPnl >= 0 ? "dc-profit" : "dc-loss"}`}>
                  Holdings: {selected.heldPnl >= 0 ? "+" : ""}₹{selected.heldPnl.toFixed(2)}
                </span>
              )}
            </h4>
            <button className="dc-table-close" onClick={() => setSelectedDomain(null)}>✕</button>
          </div>

          <div className="dc-table-scroll">
            <table className="dc-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>% Today</th>
                  {selected.hasHoldings && <th>Your P&amp;L</th>}
                </tr>
              </thead>
              <tbody>
                {selected.symbols.map((sym) => {
                  const p = prices[sym];
                  const held = holdingMap[sym];
                  const heldPnl = held && p ? (p.price - held.avg) * held.qty : null;
                  const isUp = p ? (p.percent ?? 0) >= 0 : true;

                  return (
                    <tr key={sym}>
                      <td className="dc-td-sym">
                        {sym}
                        {held && <span className="dc-held-tag">held</span>}
                      </td>
                      <td className="dc-td-price">{p ? `₹${p.price.toFixed(2)}` : "—"}</td>
                      <td className={`dc-td-chg ${p ? (isUp ? "dc-profit" : "dc-loss") : ""}`}>
                        {p ? `${isUp ? "+" : ""}₹${(p.change ?? 0).toFixed(2)}` : "—"}
                      </td>
                      <td className={`dc-td-chg ${p ? (isUp ? "dc-profit" : "dc-loss") : ""}`}>
                        {p ? `${isUp ? "+" : ""}${(p.percent ?? 0).toFixed(2)}%` : "—"}
                      </td>
                      {selected.hasHoldings && (
                        <td className={`dc-td-chg ${heldPnl !== null ? (heldPnl >= 0 ? "dc-profit" : "dc-loss") : ""}`}>
                          {heldPnl !== null ? `${heldPnl >= 0 ? "+" : ""}₹${heldPnl.toFixed(2)}` : "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainChart;