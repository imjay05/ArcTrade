import React, { useContext } from "react";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Tooltip, Grow } from "@mui/material";
import GeneralContext from "../generalContext/GeneralContext";

const openGoogleSearch = (name) => {
  window.open(
    `https://www.google.com/search?q=${encodeURIComponent(name + " NSE stock price")}`,
    "_blank",
    "noopener,noreferrer"
  );
};

const WatchListItem = ({ stock }) => {
  const ctx = useContext(GeneralContext);
  const hasData = stock.price !== "—" && stock.price !== undefined;

  return (
    <li className="watchlist-item">
      <div className="item">
        <div className="item-name-wrap">
          <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        </div>

        <div className="item-right">
          {hasData ? (
            <div className="itemInfo">
              <span className="percent">{stock.percent}</span>
              {stock.isDown ? <KeyboardArrowDown className="down" /> : <KeyboardArrowUp className="up" />}
              <span className="price">{typeof stock.price === "number" ? stock.price.toFixed(2) : stock.price}</span>
            </div>
          ) : (
            <div className="item-skeleton">
              <span className="skeleton-pill" style={{ width: 38 }} />
              <span className="skeleton-pill" style={{ width: 52 }} />
            </div>
          )}
        </div>
      </div>

      {hasData && (
        <span className="actions">
          <span>
            <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
              <button className="buy" onClick={() => ctx.openBuyWindow(stock.name, stock.price)}>Buy</button>
            </Tooltip>
            <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
              <button className="sell" onClick={() => ctx.openBuyWindow(stock.name, stock.price)}>Sell</button>
            </Tooltip>
            <Tooltip title={`Search ${stock.name} on Google`} placement="top" arrow TransitionComponent={Grow}>
              <button className="analytics" onClick={() => openGoogleSearch(stock.name)}>↗</button>
            </Tooltip>
          </span>
        </span>
      )}
    </li>
  );
};

export default WatchListItem;