export const fmt = (val) =>
  Math.abs(val) >= 1000
    ? `₹${(Math.abs(val) / 1000).toFixed(2)}k`
    : `₹${Math.abs(val).toFixed(0)}`;