import React, { useContext } from "react";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Tooltip, Grow } from "@mui/material";
import GeneralContext from "../generalContext/GeneralContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const openGoogleSearch = (name) => {
  window.open(
    `https://www.google.com/search?q=${encodeURIComponent(name + " NSE stock price")}`,
    "_blank",
    "noopener,noreferrer"
  );
};

const WatchListItem = ({ stock }) => {
  const ctx = useContext(GeneralContext);
  const { removeCustomStock } = useAuth();
  const hasData = stock.price !== "—" && stock.price !== undefined;

  const handleRemove = async (e) => {
    e.stopPropagation();
    try {
      const res = await removeCustomStock(stock.name);
      if (res.success) toast.success(res.message);
      else toast.error(res.message || "Failed to remove stock.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove stock.");
    }
  };

  return (
    <li className="watchlist-item">
      <div className="item">
        <div className="item-name-wrap">
          <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
          {stock.isCustom && (
            <span
              title="Added by you"
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "#16a34a",
                background: "#DCFCE7",
                padding: "1px 6px",
                borderRadius: "20px",
                marginLeft: "6px",
              }}>
              MY
            </span>
          )}
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
            {stock.isCustom && (
              <Tooltip title="Remove from your list" placement="top" arrow TransitionComponent={Grow}>
                <button
                  className="analytics"
                  style={{ borderColor: "#C62828", color: "#C62828" }}
                  onClick={handleRemove}>
                  ✕
                </button>
              </Tooltip>
            )}
          </span>
        </span>
      )}
    </li>
  );
};

export default WatchListItem;