export const getTodayKey = () => {
  return new Date().toISOString().slice(0, 10);
};

export const getMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const getWeekKey = () => {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    (((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
};
