export const calculatePercentage = (used: number, total: number) => {
  if (total === 0) return 0;
  return Math.round(Math.min(100, (used / total) * 100) * 100) / 100;
};
