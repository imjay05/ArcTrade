import { useEffect } from "react";

const useLivePriceTick = (setLiveHoldings, holdingsLen) => {
  useEffect(() => {
    if (holdingsLen === 0) return;

    const id = setInterval(() => {
      setLiveHoldings((prev) =>
        prev.map((h) => ({
          ...h,
          price: +(h.price * (1 + (Math.random() * 0.004 - 0.002))).toFixed(2),
        }))
      );
    }, 3000);

    return () => clearInterval(id);
  }, [holdingsLen, setLiveHoldings]);
};

export default useLivePriceTick;