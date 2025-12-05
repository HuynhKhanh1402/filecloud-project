export const calculatePercentage = (used: number, total: number) => {
  if (total === 0) return 0;
  return Math.min(100, (used / total) * 100);
};
