import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Funds from "../funds/Funds";
import Holdings from "../holdings/Holdings";
import Orders from "../orders/Orders";
import Summary from "../summary/Summary";
import WatchList from "../watchList/WatchList";
import { GeneralContextProvider } from "../generalContext/GeneralContext";

const Dashboard = () => {
  const location = useLocation();
  const isWatchlistPage = location.pathname === "/dashboard/watchlist";

  return (
    <div className="dashboard-container">
      <GeneralContextProvider>
        <div className={`watchlist-wrapper ${isWatchlistPage ? "watchlist-wrapper--mobile-show" : ""}`}>
          <WatchList />
        </div>
      </GeneralContextProvider>

      <div className={`content ${isWatchlistPage ? "content--watchlist" : ""}`}>
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="orders" element={<Orders />} />
          <Route path="holdings" element={<Holdings />} />
          <Route path="funds" element={<Funds />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;