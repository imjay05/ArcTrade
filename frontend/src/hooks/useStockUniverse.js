import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { stocksByDomain as baseStocksByDomain } from "../data/Data";

export const useStockUniverse = () => {
  const { user } = useAuth();
  const customStocks = user?.customStocks || [];

  const stocksByDomain = useMemo(() => {
    const merged = {};
    Object.entries(baseStocksByDomain).forEach(([domain, syms]) => {
      merged[domain] = [...syms];
    });

    customStocks.forEach(({ symbol, domain }) => {
      const key = merged[domain] ? domain : "Other";
      if (!merged[key]) merged[key] = [];
      if (!merged[key].includes(symbol)) merged[key].push(symbol);
    });

    return merged;
  }, [customStocks]);

  const allSymbols = useMemo(() => Object.values(stocksByDomain).flat(), [stocksByDomain]);

  const customSymbolSet = useMemo(
    () => new Set(customStocks.map((s) => s.symbol)),
    [customStocks]
  );

  return { stocksByDomain, allSymbols, customStocks, customSymbolSet };
};


export default useStockUniverse;