import React from "react";
import { C } from "../../constants/Colors";
import { fmt } from "../../constants/Format";

const PnlBlock = ({ pnl, pnlPct, isProfit, current, invested }) => {
  const color = isProfit ? C.profit : C.loss;
  return (
    <div className={`summary-pnl-block ${isProfit ? "profit" : "loss"}`}>
      <div>
        <h3 className="summary-pnl-amount" style={{ color }}>
          {isProfit ? "+" : "−"}{fmt(pnl)}&nbsp;
          <small>({isProfit ? "+" : "−"}{Math.abs(Number(pnlPct))}%)</small>
        </h3>
        <p className="summary-pnl-label">P&amp;L</p>
      </div>
      <div className="summary-pnl-divider" />
      <div className="summary-pnl-meta">
        <p>Current Value&nbsp;<span style={{ color, fontWeight: 600 }}>{fmt(current)}</span></p>
        <p>Investment&nbsp;<span style={{ color: C.textSecondary, fontWeight: 600 }}>{fmt(invested)}</span></p>
      </div>
    </div>
  );
};

export default PnlBlock;