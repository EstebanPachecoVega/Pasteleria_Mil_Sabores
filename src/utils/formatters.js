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

// Formatear fecha según opciones
export const formatearFecha = (fecha, opciones = {}) => {
  if (!fecha) return 'N/A';
  
  const { 
    incluirHora = false,
    mostrarDiaSemana = false,
    formato = 'es-CL'
  } = opciones;

  let fechaDate;
  
  // Intentar convertir la fecha a un objeto Date
  try {
    if (typeof fecha.toDate === 'function') {
      // Timestamp de Firebase
      fechaDate = fecha.toDate();
    } else if (fecha instanceof Date) {
      // Objeto Date
      fechaDate = fecha;
    } else if (typeof fecha === 'string') {
      // String (ISO, YYYY-MM-DD, etc.)
      fechaDate = new Date(fecha);
    } else if (fecha.seconds) {
      // Timestamp de Firebase como objeto {seconds, nanoseconds}
      fechaDate = new Date(fecha.seconds * 1000);
    } else {
      // Intentar convertir de cualquier forma
      fechaDate = new Date(fecha);
    }

    // Validar que sea una fecha válida
    if (isNaN(fechaDate.getTime())) {
      return 'Fecha inválida';
    }

    // Opciones de formato
    const opcionesFormato = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(incluirHora && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      ...(mostrarDiaSemana && {
        weekday: 'long'
      })
    };

    return fechaDate.toLocaleDateString(formato, opcionesFormato);
    
  } catch (error) {
    console.error('Error al formatear fecha:', error, fecha);
    return 'Error en fecha';
  }
};

// Formatear fecha para fecha-hora (con hora)
export const formatearFechaHora = (fecha) => {
  return formatearFecha(fecha, { incluirHora: true });
};

// Formatear fecha para solo hora
export const formatearHora = (fecha) => {
  if (!fecha) return '';
  
  try {
    let fechaDate;
    
    if (typeof fecha.toDate === 'function') {
      fechaDate = fecha.toDate();
    } else if (fecha instanceof Date) {
      fechaDate = fecha;
    } else if (typeof fecha === 'string') {
      fechaDate = new Date(fecha);
    } else if (fecha.seconds) {
      fechaDate = new Date(fecha.seconds * 1000);
    } else {
      fechaDate = new Date(fecha);
    }

    if (isNaN(fechaDate.getTime())) {
      return '';
    }

    return fechaDate.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return '';
  }
};