import React, { useState } from "react";
import BuyActionWindow from "../buyActionWindow/BuyActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid, price) => {},
  closeBuyWindow: () => {},
  selectedPrice: 0,
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);

  const handleOpenBuyWindow = (uid, price) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedPrice(price || 0);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setSelectedPrice(0);
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        selectedPrice,
      }}>
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow uid={selectedStockUID} price={selectedPrice} />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;