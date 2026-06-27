import React, { useState } from "react";
import "./Signup.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const loginAndRedirect = (token, user) => {
    localStorage.setItem("arctrade_token", token);
    localStorage.setItem("arctrade_user", JSON.stringify(user));
    setSuccess("Account created! Redirecting...");
    setTimeout(() => { window.location.href = "/dashboard"; }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError("Please fill in all fields.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (data.success) {
        loginAndRedirect(data.token, data.user);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch {
      setError("Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][strength];
  const strengthColor = ["", "#C62828", "#f59e0b", "#16a34a", "#0d9488", "#0d6b32"][strength];

  return (
    <div className="signup-page">
      <div className="signup-panel signup-panel--left">
        <div className="signup-form-wrap">
          <div className="signup-mobile-brand">
            <a href="/login" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <img src="/logo.png" alt="ArcTrade" />
              <span>ArcTrade</span>
            </a>
          </div>

          <div className="signup-form-header">
            <h2 className="signup-form-title">Create your account</h2>
            <p className="signup-form-sub">
              Already have one?{" "}
              <a href="/login" className="signup-form-link">Sign in →</a>
            </p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="sf-field">
              <label htmlFor="name">Full Name</label>
              <div className="sf-input-wrap">
                <span className="sf-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input id="name" type="text" name="name" placeholder="user name" value={form.name} onChange={handleChange} autoComplete="name" autoFocus />
              </div>
            </div>

            <div className="sf-field">
              <label htmlFor="email">Email Address</label>
              <div className="sf-input-wrap">
                <span className="sf-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input id="email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>

            <div className="sf-field">
              <label htmlFor="password">Password</label>
              <div className="sf-input-wrap">
                <span className="sf-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input id="password" type={showPwd ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                <button type="button" className="sf-toggle-pwd" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {form.password && (
                <div className="sf-strength">
                  <div className="sf-strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="sf-strength-bar" style={{ background: i <= strength ? strengthColor : "#e5e7eb" }} />
                    ))}
                  </div>
                  <span className="sf-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="sf-field">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="sf-input-wrap">
                <span className="sf-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  style={{ borderColor: form.confirm ? (form.confirm === form.password ? "#16a34a" : "#C62828") : undefined }}
                />
                <button type="button" className="sf-toggle-pwd" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className="sf-alert sf-alert--error">⚠ {error}</div>}
            {success && <div className="sf-alert sf-alert--success">✓ {success}</div>}

            <button type="submit" className="sf-submit" disabled={loading || !!success}>
              {loading ? (
                <span className="sf-spinner" />
              ) : (
                <>
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="signup-legal">
            By creating an account you agree to our{" "}
            <a href="#">Terms of Service</a>.
          </p>
        </div>
      </div>

      <div className="signup-panel signup-panel--right">
        <div className="signup-panel__brand">
          <a href="/login" className="signup-brand-link">
            <div className="signup-brand-img-wrap">
              <img src="/logo.png" alt="ArcTrade" className="signup-brand-img" />
            </div>
            <span className="signup-brand-name">ArcTrade</span>
          </a>
        </div>

        <div className="signup-panel__content">
          <h1 className="signup-panel__headline">
            Start your<br />trading<br />journey.
          </h1>
          <p className="signup-panel__sub">
            Join thousands of investors using ArcTrade to track, trade, and grow their portfolios — commission-free.
          </p>

          <div className="signup-panel__perks">
            {[
              { icon: "✓", text: "Zero commission on all trades" },
              { icon: "✓", text: "Real-time NSE stock data" },
              { icon: "✓", text: "Candlestick charts & analytics" },
              { icon: "✓", text: "Instant UPI fund transfers" },
            ].map((p, i) => (
              <div key={i} className="signup-perk">
                <span className="signup-perk__icon">{p.icon}</span>
                <span className="signup-perk__text">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <svg className="signup-panel__deco" viewBox="0 0 400 300" preserveAspectRatio="none">
          <polyline points="0,220 80,180 160,200 240,140 320,100 400,60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5"/>
          <circle cx="400" cy="60" r="5" fill="rgba(255,255,255,0.25)"/>
          <polyline points="0,260 80,240 160,250 240,210 320,180 400,140" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  );
}

export default Signup;