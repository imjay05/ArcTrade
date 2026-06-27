import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const useHoldings = () => {
  const [holdings, setHoldings] = useState([]);
  const [liveHoldings, setLiveHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(true);

  const fetchHoldings = useCallback(() => {
    setHoldingsLoading(true);
    axios
      .get(`${API}/api/holdings`)
      .then((res) => {
        const data = res.data.data || res.data;
        const arr = Array.isArray(data) ? data : [];
        setHoldings(arr);
        setLiveHoldings(arr.map((h) => ({ ...h })));
      })
      .catch(() => { setHoldings([]); setLiveHoldings([]); })
      .finally(() => setHoldingsLoading(false));
  }, []);

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  return { holdings, liveHoldings, setLiveHoldings, holdingsLoading };
};

export default useHoldings;