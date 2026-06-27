import React from "react";
import { useAuth } from "../../context/AuthContext";
import { C } from "../../constants/Colors";
import useHoldings from "../../hooks/useHoldings";
import useLivePriceTick from "../../hooks/useLivePriceTick";
import PnlBlock from "./PnlBlock";
import DomainChart from "../domainChart/DomainChart";
import "./Summary.css";

const Summary = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "User";

  const { holdings, liveHoldings, setLiveHoldings, holdingsLoading } = useHoldings();

  useLivePriceTick(setLiveHoldings, liveHoldings.length);

  const holdInvested = holdings.reduce((s, h) => s + (h.avg || h.price) * h.qty, 0);
  const holdCurrent = liveHoldings.reduce((s, h) => s + h.price * h.qty, 0);
  const holdPnl = holdCurrent - holdInvested;
  const holdPnlPct = holdInvested > 0 ? ((holdPnl / holdInvested) * 100).toFixed(2) : "0.00";
  const holdProfit = holdPnl >= 0;

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>

      <h6 className="summary-greeting" style={{ color: C.textPrimary }}>Hi, {firstName}!</h6>
      <hr className="summary-divider" />

      <p className="summary-section-label">Equity</p>
      <div className="summary-equity-block">
        <div>
          <h3 className="summary-equity-amount">
            ₹{(user?.walletBalance || 0).toLocaleString("en-IN")}
          </h3>
          <p className="summary-equity-label">Margin available</p>
        </div>
        <div className="summary-pnl-divider" />
        <div className="summary-pnl-meta">
          <p>Margins used&nbsp;<span style={{ color: C.textSecondary, fontWeight: 600 }}>0</span></p>
          <p>
            Opening balance&nbsp;
            <span style={{ color: C.textSecondary, fontWeight: 600 }}>
              ₹{(user?.walletBalance || 0).toLocaleString("en-IN")}
            </span>
          </p>
        </div>
      </div>
      <hr className="summary-divider" />

      <p className="summary-section-label">Holdings ({holdingsLoading ? "…" : holdings.length})</p>
      {holdingsLoading ? (
        <p className="summary-muted">Loading…</p>
      ) : liveHoldings.length === 0 ? (
        <p className="summary-muted">No holdings found.</p>
      ) : (
        <PnlBlock pnl={holdPnl} pnlPct={holdPnlPct} isProfit={holdProfit} current={holdCurrent} invested={holdInvested} />
      )}

      <hr className="summary-divider" />

      <DomainChart />

    </div>
  );
};

export default Summary;