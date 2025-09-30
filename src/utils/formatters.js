// src/utils/formatters.js
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};