export const formatPrice = (price) => {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Formatear categoría para mostrar al usuario
export const formatearCategoria = (categoria) => {
  if (!categoria || categoria.trim() === '') {
    return 'Sin categoría';
  }

  if (!categoria.includes('-') && !categoria.includes('_') &&
    categoria.charAt(0) === categoria.charAt(0).toUpperCase()) {
    return categoria;
  }

  if (categoria.includes('-')) {
    return categoria
      .split('-')
      .map(palabra => {
        if (palabra === 'sin') return 'Sin';
        if (palabra === 'y') return 'y';
        if (palabra === 'de') return 'de';
        if (palabra === 'del') return 'del';
        if (palabra === 'la') return 'la';
        if (palabra === 'las') return 'las';
        if (palabra === 'el') return 'el';
        if (palabra === 'los') return 'los';
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(' ');
  }

  if (categoria.includes('_')) {
    return categoria
      .split('_')
      .map(palabra => {
        const palabraLower = palabra.toLowerCase();
        if (palabraLower === 'sin') return 'Sin';
        if (palabraLower === 'y') return 'y';
        if (palabraLower === 'de') return 'de';
        if (palabraLower === 'del') return 'del';
        if (palabraLower === 'la') return 'la';
        if (palabraLower === 'las') return 'las';
        if (palabraLower === 'el') return 'el';
        if (palabraLower === 'los') return 'los';
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(' ');
  }

  return categoria
    .split(' ')
    .map(palabra => {
      const palabraLower = palabra.toLowerCase();
      if (palabraLower === 'sin') return 'Sin';
      if (palabraLower === 'y') return 'y';
      if (palabraLower === 'de') return 'de';
      if (palabraLower === 'del') return 'del';
      if (palabraLower === 'la') return 'la';
      if (palabraLower === 'las') return 'las';
      if (palabraLower === 'el') return 'el';
      if (palabraLower === 'los') return 'los';
      return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    })
    .join(' ');
};

// Normalizar texto para búsquedas
export const normalizarTextoBusqueda = (texto) => {
  if (!texto) return '';

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};