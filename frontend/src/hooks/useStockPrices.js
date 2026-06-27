import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const globalCache = { prices: {}, ts: 0 };
const CACHE_TTL = 3 * 60 * 1000;
const POLL_INTERVAL = 3 * 60 * 1000;
const PRIORITY_COUNT = 40;

export const useStockPrices = (symbolList = []) => {
  const [prices, setPrices] = useState({ ...globalCache.prices });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const symbolKey = [...symbolList].sort().join(",");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchPrices = async (symbols, background = false) => {
    if (!symbols.length) return;
    const encoded = symbols.map((s) => encodeURIComponent(s)).join(",");

    if (!background) setLoading(true);

    try {
      const { data } = await axios.get(`${API}/api/stock-prices/bulk?symbols=${encoded}`, { timeout: 20000 });

      if (!mountedRef.current) return;

      if (data.success && Array.isArray(data.data) && data.data.length) {
        const map = {};
        data.data.forEach((q) => { map[q.symbol] = q; });

        globalCache.prices = { ...globalCache.prices, ...map };
        globalCache.ts = Date.now();

        setPrices((prev) => ({ ...prev, ...map }));
        setError(null);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message);
      if (Object.keys(globalCache.prices).length) setPrices(globalCache.prices);
    } finally {
      if (mountedRef.current && !background) setLoading(false);
    }
  };

  useEffect(() => {
    if (!symbolList.length) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    const stale = symbolList.filter((sym) => {
      const cached = globalCache.prices[sym];
      return !cached || (now - (cached.fetchedAt || 0)) > CACHE_TTL;
    });

    if (stale.length === 0) {
      setPrices({ ...globalCache.prices });
      setLoading(false);
    } else {
      const priority = stale.slice(0, PRIORITY_COUNT);
      const background = stale.slice(PRIORITY_COUNT);

      fetchPrices(priority, false).then(() => {
        if (background.length && mountedRef.current) fetchPrices(background, true);
      });
    }

    const id = setInterval(() => fetchPrices(symbolList, true), POLL_INTERVAL);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolKey]);

  const refresh = () => {
    symbolList.forEach((sym) => {
      if (globalCache.prices[sym]) globalCache.prices[sym].fetchedAt = 0;
    });
    setLoading(true);
    fetchPrices(symbolList, false);
  };

  return { prices, loading, error, refresh };
};

export default useStockPrices;