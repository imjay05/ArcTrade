import React, { useState } from "react";
import "./Login.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const loginAndRedirect = (token, user) => {
    localStorage.setItem("arctrade_token", token);
    localStorage.setItem("arctrade_user", JSON.stringify(user));
    setSuccess("Login successful! Redirecting...");
    setTimeout(() => { window.location.href = "/dashboard"; }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Please enter your email and password.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (data.success) {
        loginAndRedirect(data.token, data.user);
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch {
      setError("Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel login-panel--left">
        <div className="login-panel__brand">
          <a href="/login" className="login-brand-link">
            <div className="login-brand-img-wrap">
              <img src="/logo.png" alt="ArcTrade" className="login-brand-img" />
            </div>
            <span className="login-brand-name">ArcTrade</span>
          </a>
        </div>

        <div className="login-panel__content">
          <div className="login-panel__tagline">
            <h1>Welcome<br />back.</h1>
            <p>Your portfolio is waiting.<br />Markets don't sleep — neither do we.</p>
          </div>

          <div className="login-panel__stats">
            {[
              { value: "50+", label: "Live Stocks" },
              { value: "₹0", label: "Commission" },
              { value: "Real", label: "Time Data" },
            ].map((s) => (
              <div key={s.label} className="login-stat">
                <span className="login-stat__value">{s.value}</span>
                <span className="login-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <svg className="login-panel__deco" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polyline points="0,160 60,130 120,145 180,100 240,115 300,70 360,50 400,40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
          <polyline points="0,180 60,165 120,170 180,140 240,150 300,110 360,90 400,80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>
        </svg>
      </div>

      <div className="login-panel login-panel--right">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <a href="/login" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <img src="/logo.png" alt="ArcTrade" />
              <span>ArcTrade</span>
            </a>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Sign in to your account</h2>
            <p className="login-form-sub">
              Don't have an account?{" "}
              <a href="/signup" className="login-form-link">Create one →</a>
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="lf-field">
              <label htmlFor="email">Email address</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input id="email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" autoFocus />
              </div>
            </div>

            <div className="lf-field">
              <div className="lf-label-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="lf-input-wrap">
                <span className="lf-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input id="password" type={showPwd ? "text" : "password"} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password" />
                <button type="button" className="lf-toggle-pwd" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
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
            </div>

            {error && <div className="lf-alert lf-alert--error">⚠ {error}</div>}
            {success && <div className="lf-alert lf-alert--success">✓ {success}</div>}

            <button type="submit" className="lf-submit" disabled={loading || !!success}>
              {loading ? (
                <span className="lf-spinner" />
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-legal">
            By signing in you agree to our{" "}
            <a href="#">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;