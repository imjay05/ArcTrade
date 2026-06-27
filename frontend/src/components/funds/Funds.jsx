import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "./Funds.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Funds = () => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddFunds = async () => {
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum < 1) {
      toast.error("Please enter a valid amount (min ₹1).");
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please check your connection.");
        return;
      }

      const orderRes = await axios.post(`${API}/api/payment/create-order`, { amount: amountNum });

      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || "Payment initiation failed.");
        return;
      }

      const { orderId, amount: orderAmount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: orderAmount,
        currency,
        name: "ArcTrade",
        description: "Add Funds to Wallet",
        order_id: orderId,
        handler: async (response) => {
          try {
            const token = localStorage.getItem("arctrade_token");
            const verifyRes = await axios.post(`${API}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (verifyRes.data.success) {
              toast.success(verifyRes.data.message);
              setAmount("");
              await refreshUser();
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed.");
            }
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#16a34a" },
        modal: { ondismiss: () => toast("Payment cancelled.", { icon: "ℹ️" }) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => toast.error(`Payment failed: ${r.error.description}`));
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const walletBalance = user?.walletBalance || 0;

  return (
    <>
      <div className="funds-header">
        <p>Instant, zero-cost fund transfers with UPI</p>
        <button className="btn btn-blue" onClick={handleAddFunds} disabled={loading}>
          {loading ? "Processing..." : "Add funds"}
        </button>
      </div>

      <div className="funds-amount-row">
        <input
          type="number"
          className="funds-amount-input"
          placeholder="Enter amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
        <div className="funds-quick-buttons">
          {[500, 1000, 5000, 10000].map((q) => (
            <button
              key={q}
              className={`funds-quick-btn ${Number(amount) === q ? "active" : "inactive"}`}
              onClick={() => setAmount(q)}>
              ₹{q.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      <div className="funds-wallet-card">
        <div>
          <p className="funds-wallet-label">Available Wallet Balance</p>
          <h3 className="funds-wallet-balance">₹{walletBalance.toLocaleString("en-IN")}</h3>
        </div>
        <span className="funds-wallet-icon">💰</span>
      </div>
    </>
  );
};

export default Funds;