import React from "react";
import Menu from "../menu/Menu";
import "./TopBar.css";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="topbar-menu">
        <Menu />
      </div>
    </div>
  );
};

export default TopBar;