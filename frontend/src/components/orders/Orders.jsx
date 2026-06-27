import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Orders.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const STATUS_CLASS = {
  COMPLETE: "complete",
  PENDING: "pending",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API}/api/orders`)
      .then((res) => {
        const data = res.data.data || res.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) {
    return <p style={{ padding: "20px", color: "#aaa" }}>Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to="/dashboard/watchlist" className="btn btn-blue">Get started</Link>
        </div>
      </div>
    );
  }

  const buyOrders = orders.filter((o) => o.mode === "BUY");
  const sellOrders = orders.filter((o) => o.mode === "SELL");
  const totalBuy = buyOrders.reduce((s, o) => s + o.qty * o.price, 0);
  const totalSell = sellOrders.reduce((s, o) => s + o.qty * o.price, 0);
  const netPnl = totalSell - totalBuy;
  const isProfit = netPnl >= 0;

  const summaryCards = [
    { label: "Total Orders", value: orders.length, color: "#555" },
    { label: "Buy Orders", value: buyOrders.length, color: "#16a34a" },
    { label: "Sell Orders", value: sellOrders.length, color: "#C62828" },
    {
      label: "Net P&L",
      value: `${isProfit ? "+" : "−"}₹${Math.abs(netPnl).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      color: isProfit ? "#16a34a" : "#C62828",
    },
  ];

  return (
    <>
      <div className="orders-header">
        <h3 className="title" style={{ margin: 0 }}>Orders ({orders.length})</h3>
        <button className="orders-refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
      </div>

      <div className="orders-summary-cards">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="orders-summary-card">
            <p className="orders-summary-card-label">{label}</p>
            <p className="orders-summary-card-value" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className={`orders-pnl-bar ${isProfit ? "profit" : "loss"}`}>
        <span>
          📊 Total BUY: <strong>₹{totalBuy.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Total SELL: <strong>₹{totalSell.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
        </span>
        <span className="orders-pnl-bar-net">
          Net P&L: {isProfit ? "+" : "−"}₹{Math.abs(netPnl).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div className="order-table" style={{ minWidth: 560 }}>
          <table>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Type</th>
                <th>Qty.</th>
                <th>Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const isBuy = order.mode === "BUY";
                const total = order.qty * order.price;
                const status = order.status || "COMPLETE";

                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{order.name}</td>
                    <td>
                      <span className={`order-type-badge ${isBuy ? "buy" : "sell"}`}>{order.mode}</span>
                    </td>
                    <td>{order.qty}</td>
                    <td>₹{Number(order.price).toFixed(2)}</td>
                    <td className={isBuy ? "order-total-buy" : "order-total-sell"}>
                      {isBuy ? "−" : "+"}₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`order-status-badge ${STATUS_CLASS[status] || "complete"}`}>{status}</span>
                    </td>
                    <td className="order-time-cell">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Orders;