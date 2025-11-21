// src/utils/formatters.js
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatearCategoria = (categoria) => {
  if (!categoria || categoria === 'Sin categoría' || categoria === 'sin_categoria') {
    return 'Sin categoría';
  }
  
  // Si ya está formateada correctamente, no hacer cambios
  if (categoria === categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase() && 
      !categoria.includes('_') && !categoria.includes('-')) {
    return categoria;
  }
  
  // Reemplazar underscores y guiones con espacios
  let formateada = categoria.replace(/[_-]/g, ' ');
  
  // Capitalizar cada palabra
  formateada = formateada.replace(/\w\S*/g, (palabra) => {
    if (palabra.length <= 3 && palabra.toUpperCase() === palabra) {
      return palabra.charAt(0).toUpperCase() + palabra.substr(1).toLowerCase();
    }
    return palabra.charAt(0).toUpperCase() + palabra.substr(1).toLowerCase();
  });
  
  return formateada;
};