import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Menu.css";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "/";

const Menu = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setIsMobileProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = FRONTEND_URL;
  };

  const desktopMenuItems = [
    { label: "Dashboard", path: "/dashboard",         icon: "📊" },
    { label: "Orders",    path: "/dashboard/orders",   icon: "📋" },
    { label: "Holdings",  path: "/dashboard/holdings", icon: "💼" },
    { label: "Funds",     path: "/dashboard/funds",    icon: "💰" },
  ];

  const menuItems = [
    { label: "Dashboard", path: "/dashboard",          icon: "📊" },
    { label: "Orders",    path: "/dashboard/orders",   icon: "📋" },
    { label: "Holdings",  path: "/dashboard/holdings", icon: "💼" },
    { label: "Funds",     path: "/dashboard/funds",    icon: "💰" },
    { label: "Watchlist", path: "/dashboard/watchlist",icon: "⭐" },
  ];

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const ProfileDropdown = () => (
    <div className="profile-dropdown">
      <div className="profile-dropdown-header">
        <p className="profile-name">{user?.name}</p>
        <p className="profile-email">{user?.email}</p>
        <p className="profile-userid">ID: {user?.userId}</p>
      </div>
      <div className="profile-dropdown-wallet">
        <span>Wallet</span>
        <span className="wallet-balance">
          ₹{(user?.walletBalance || 0).toLocaleString("en-IN")}
        </span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );

  return (
    <>
      <div className="menu-container">
        <a href={FRONTEND_URL} className="menu-logo-link">
          <img src="/logo.png" alt="ArcTrade" className="menu-logo" width={28} height={28} />
          <span className="menu-brand-name">ArcTrade</span>
        </a>

        <div className="menus">
          <ul>
            {desktopMenuItems.map((item) => (
              <li key={item.path}>
                <Link style={{ textDecoration: "none" }} to={item.path}>
                  <p className={location.pathname === item.path ? "menu selected" : "menu"}>
                    {item.label}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <hr />
          <div className="profile" ref={dropdownRef} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
            <div className="avatar">{getInitials()}</div>
            {isProfileDropdownOpen && <ProfileDropdown />}
          </div>
        </div>

        <div className="menu-mobile-right">
          <div
            className="profile profile--mobile"
            ref={mobileDropdownRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen);
            }}>
            <div className="avatar menu-mobile-avatar">{getInitials()}</div>
            {isMobileProfileDropdownOpen && <ProfileDropdown />}
          </div>

          <button
            className={`dashboard-hamburger ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div
        className={`dashboard-mobile-nav ${mobileOpen ? "open" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}>
        <div className="dashboard-mobile-nav__panel">
          <div className="dashboard-mobile-nav__section-label">Navigation</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: "none" }}
              onClick={() => setMobileOpen(false)}>
              <div className={`dashboard-mobile-nav__item ${location.pathname === item.path ? "selected" : ""}`}>
                <span className="dashboard-mobile-nav__item-icon">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Menu;