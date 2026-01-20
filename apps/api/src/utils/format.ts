export const formatCurrency = (value: number, currency = "MXN") => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatHourLabel = (date: Date) => date.toISOString().slice(11, 16);
