// Crear slug de categoría a partir del nombre
export const crearSlugCategoria = (nombre) => {
    if (!nombre) return '';

    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');
};

// Crear ID de categoría a partir del nombre
export const crearIdCategoria = (nombre) => {
    if (!nombre) return '';

    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
};

// Extraer slug de URL
export const extraerSlugDeUrl = (url) => {
    if (!url) return '';

    const partes = url.split('/');
    return partes[partes.length - 1];
};

// Mapeo de categorías antiguas a nuevas
export const mapeoCategoriasAntiguas = {
    'Sin Gluten': { id: 'cat_sin_gluten', slug: 'sin-gluten' },
    'Sin Azúcar': { id: 'cat_sin_azucar', slug: 'sin-azucar' },
    'Productos Veganos': { id: 'cat_veganos', slug: 'productos-veganos' },
    'Postres Individuales': { id: 'cat_individuales', slug: 'postres-individuales' },
    'Pastelería Tradicional': { id: 'cat_tradicional', slug: 'pasteleria-tradicional' },
    'Tortas Cuadradas': { id: 'cat_cuadradas', slug: 'tortas-cuadradas' },
    'Tortas Circulares': { id: 'cat_circulares', slug: 'tortas-circulares' },
    'Tortas Especiales': { id: 'cat_especiales', slug: 'tortas-especiales' }
};

// Obtener información de migración de categoría
export const getInfoMigracionCategoria = (nombreAntiguo) => {
    return mapeoCategoriasAntiguas[nombreAntiguo] || {
        id: crearIdCategoria(nombreAntiguo),
        slug: crearSlugCategoria(nombreAntiguo),
        nombre: nombreAntiguo
    };
};