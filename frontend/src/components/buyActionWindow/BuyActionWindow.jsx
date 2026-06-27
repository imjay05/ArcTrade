import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import GeneralContext from "../generalContext/GeneralContext";
import { useAuth } from "../../context/AuthContext";
import "./BuyActionWindow.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const BuyActionWindow = ({ uid, price }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(price || 0);
  const [orderType, setOrderType] = useState("Market");
  const [validity, setValidity] = useState("DAY");
  const [orderMode, setOrderMode] = useState("BUY");
  const [loading, setLoading] = useState(false);
  const [priceAge, setPriceAge] = useState(0);

  const generalContext = useContext(GeneralContext);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setPriceAge((a) => a + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (orderType === "Market") setStockPrice(price || 0);
  }, [orderType, price]);

  const effectivePrice = orderType === "Market" ? (price || 0) : Number(stockPrice);
  const estimatedCost = Number(stockQuantity) * effectivePrice;
  const walletBalance = user?.walletBalance || 0;
  const insufficientFunds = orderMode === "BUY" && estimatedCost > walletBalance && estimatedCost > 0;
  const marginRequired = estimatedCost > 0 ? estimatedCost.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";

  const handleOrderClick = async () => {
    if (!stockQuantity || Number(stockQuantity) <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    if (orderType === "Limit" && (!stockPrice || Number(stockPrice) <= 0)) {
      toast.error("Please enter a valid price for limit order.");
      return;
    }
    if (insufficientFunds) {
      toast.error(`Insufficient funds. Need ₹${estimatedCost.toLocaleString("en-IN")} but wallet has ₹${walletBalance.toLocaleString("en-IN")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/orders/new`, {
        name: uid,
        qty: Number(stockQuantity),
        price: effectivePrice,
        mode: orderMode,
        orderType,
        validity,
      });
      if (res.data.success) {
        toast.success(res.data.message || `${orderMode} order placed for ${uid}!`);
        await refreshUser();
        generalContext.closeBuyWindow();
      } else {
        toast.error(res.data.message || "Order failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-window-container" id="buy-window" draggable="true">

      <div className="header" style={{ background: orderMode === "BUY" ? "#16a34a" : "#C62828" }}>
        <h3>{uid} <span>NSE</span></h3>
        <div className="buy-sell-toggle">
          <button onClick={() => setOrderMode("BUY")} className={orderMode === "BUY" ? "active-buy" : "inactive"}>BUY</button>
          <button onClick={() => setOrderMode("SELL")} className={orderMode === "SELL" ? "active-sell" : "inactive"}>SELL</button>
        </div>
        <p className="market-options">
          <label>
            <input type="radio" name="order" checked={orderType === "Market"} onChange={() => setOrderType("Market")} /> Market
          </label>
          &nbsp;&nbsp;
          <label>
            <input type="radio" name="order" checked={orderType === "Limit"} onChange={() => setOrderType("Limit")} /> Limit
          </label>
        </p>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input type="number" name="qty" id="qty" min="1" onChange={(e) => setStockQuantity(e.target.value)} value={stockQuantity} />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number" name="price" id="price" step="0.05"
              placeholder={orderType === "Market" ? "Market" : "0.00"}
              onChange={(e) => setStockPrice(e.target.value)}
              value={orderType === "Market" ? (price || "") : stockPrice}
              disabled={orderType === "Market"}
            />
          </fieldset>
        </div>

        {orderType === "Market" && priceAge > 30 && (
          <div className="stale-price-warning">
            ⚠️ Price shown may be stale ({priceAge}s old). Actual execution price may differ.
          </div>
        )}

        <div className="order-validity">
          <label>
            <input type="radio" name="validity" checked={validity === "DAY"} onChange={() => setValidity("DAY")} />
            DAY <span style={{ color: "#bbb" }}>(Regular)</span>
          </label>
          <label>
            <input type="radio" name="validity" checked={validity === "IOC"} onChange={() => setValidity("IOC")} />
            IOC
          </label>
        </div>

        <div className="product-info-bar">📌 Delivery order — added to your Holdings</div>

        <div className="wallet-cost-row">
          <span>
            Wallet:&nbsp;
            <strong style={{ color: insufficientFunds ? "#C62828" : "#16a34a" }}>
              ₹{walletBalance.toLocaleString("en-IN")}
            </strong>
          </span>
          {estimatedCost > 0 && (
            <span>
              Est. cost:&nbsp;
              <strong style={{ color: insufficientFunds ? "#C62828" : (orderMode === "BUY" ? "#16a34a" : "#C62828") }}>
                ₹{estimatedCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </strong>
            </span>
          )}
        </div>

        {insufficientFunds && (
          <div className="insufficient-funds">
            Insufficient funds. Need ₹{estimatedCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            — short by ₹{(estimatedCost - walletBalance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <div className="buttons">
        <span>{estimatedCost > 0 ? `Est. total ₹${marginRequired}` : "Enter qty & price"}</span>
        <div>
          <button
            className={`btn-action ${insufficientFunds ? "insufficient" : orderMode === "BUY" ? "buy" : "sell"}`}
            onClick={handleOrderClick}
            disabled={loading || insufficientFunds}>
            {loading ? "Placing..." : orderMode === "BUY" ? "Buy" : "Sell"}
          </button>
          <button className="btn-grey" onClick={() => generalContext.closeBuyWindow()}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;