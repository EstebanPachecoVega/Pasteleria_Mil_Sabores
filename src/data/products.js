// Datos de productos organizados por categorías
export const products = {
    individuales: [
        {
            id: 'PI001',
            name: 'Mousse de Chocolate',
            description: 'Postre individual cremoso y suave, hecho con chocolate de alta calidad, ideal para los amantes del chocolate.',
            price: 5000,
            image: '/images/productos/mousse_de_chocolate.png',
            images: [
                '/images/productos/mousse_de_chocolate.png',
                '/images/productos/tiramisu_clasico.png',
                '/images/productos/torta_sin_azucar_de_naranja.png',
                '/images/productos/cheesecake_sin_azucar.png'
            ],
            category: 'individuales'
        },
        {
            id: 'PI002',
            name: 'Tiramisú Clásico',
            description: 'Un postre italiano individual con capas de café, mascarpone y cacao, perfecto para finalizar cualquier comida.',
            price: 5500,
            image: '/images/productos/tiramisu_clasico.png',
            category: 'individuales'
        }
    ],
    sin_azucar: [
        {
            id: 'PSA001',
            name: 'Torta Sin Azúcar de Naranja',
            description: 'Torta ligera y deliciosa, endulzada naturalmente, ideal para quienes buscan opciones más saludables.',
            price: 48000,
            image: '/images/productos/torta_sin_azucar_de_naranja.png',
            category: 'sin_azucar'
        },
        {
            id: 'PSA002',
            name: 'Cheesecake Sin Azúcar',
            description: 'Suave y cremoso, este cheesecake es una opción perfecta para disfrutar sin culpa.',
            price: 47000,
            image: '/images/productos/cheesecake_sin_azucar.png',
            category: 'sin_azucar'
        }
    ],
    sin_gluten: [
        {
            id: 'PG001',
            name: 'Brownie Sin Gluten',
            description: 'Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten sin sacrificar el sabor.',
            price: 4000,
            image: '/images/productos/brownie_sin_gluten.png',
            category: 'sin_gluten'
        },
        {
            id: 'PG002',
            name: 'Pan Sin Gluten',
            description: 'Suave y esponjoso, ideal para sándwiches o para acompañar cualquier comida.',
            price: 3500,
            image: '/images/productos/pan_sin_gluten.png',
            category: 'sin_gluten'
        }
    ],
    veganos: [
        {
            id: 'PV001',
            name: 'Torta Vegana de Chocolate',
            description: 'Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal, perfecta para veganos.',
            price: 50000,
            image: '/images/productos/torta_vegana_de_chocolate.png',
            category: 'veganos'
        },
        {
            id: 'PV002',
            name: 'Galletas Veganas de Avena',
            description: 'Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable y vegano.',
            price: 4500,
            image: '/images/productos/galletas_veganas_de_avena.png',
            category: 'veganos'
        }
    ],
    circulares: [
        {
            id: 'TC001',
            name: 'Torta Circular de Vainilla',
            description: 'Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce, perfecto para cualquier ocasión.',
            price: 40000,
            image: '/images/productos/torta_circular_de_vainilla.png',
            category: 'circulares'
        },
        {
            id: 'TC002',
            name: 'Torta Circular de Manjar',
            description: 'Torta tradicional chilena con manjar y nueces, un deleite para los amantes de los sabores dulces y clásicos.',
            price: 42000,
            image: '/images/productos/torta_circular_de_manjar.png',
            category: 'circulares'
        }
    ],
    cuadradas: [
        {
            id: 'TQ001',
            name: 'Torta Cuadrada de Chocolate',
            description: 'Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.',
            price: 45000,
            image: '/images/productos/torta_cuadrada_de_chocolate.png',
            category: 'cuadradas'
        },
        {
            id: 'TQ002',
            name: 'Torta Cuadrada de Frutas',
            description: 'Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones.',
            price: 50000,
            image: '/images/productos/torta_cuadrada_de_frutas.png',
            category: 'cuadradas'
        }
    ],
    especiales: [
        {
            id: 'TE001',
            name: 'Torta Especial de Cumpleaños',
            description: 'Diseñada especialmente para celebraciones, personalizable con decoraciones y mensajes únicos.',
            price: 55000,
            image: '/images/productos/torta_especial_de_cumpleanos.png',
            category: 'especiales'
        },
        {
            id: 'TE002',
            name: 'Torta Especial de Boda',
            description: 'Elegante y deliciosa, esta torta está diseñada para ser el centro de atención en cualquier boda.',
            price: 60000,
            image: '/images/productos/torta_especial_de_boda.png',
            category: 'especiales'
        }
    ],
    tradicional: [
        {
            id: 'PT001',
            name: 'Empanada de Manzana',
            description: 'Pastelería tradicional rellena de manzanas especiadas, perfecta para un dulce desayuno o merienda.',
            price: 3000,
            image: '/images/productos/empanadas_de_manzana.png',
            category: 'tradicional'
        },
        {
            id: 'PT002',
            name: 'Tarta de Santiago',
            description: 'Tradicional tarta española hecha con almendras, azúcar, y huevos, una delicia para los amantes de los postres clásicos.',
            price: 6000,
            image: '/images/productos/tarta_de_santiago.png',
            category: 'tradicional'
        }
    ]
};

// Metodos 

// Función para normalizar texto (sin tildes, minúsculas)
export const normalizeText = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
        .trim();
};

// Función para buscar productos
export const searchProducts = (query) => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = normalizeText(query);
    const allProducts = Object.values(products).flat();

    return allProducts.filter(product => {
        const normalizedName = normalizeText(product.name);
        const normalizedDescription = normalizeText(product.description);
        const normalizedCategory = normalizeText(product.category);

        return normalizedName.includes(normalizedQuery) ||
            normalizedDescription.includes(normalizedQuery) ||
            normalizedCategory.includes(normalizedQuery);
    });
};

// Función para obtener sugerencias de búsqueda
export const getSearchSuggestions = (query, limit = 5) => {
    const results = searchProducts(query);
    return results.slice(0, limit);
};

// Función para obtener todos los productos
export const getAllProducts = () => {
    return Object.values(products).flat();
};

// Función para obtener productos por categoría
export const getProductsByCategory = (category) => {
    return products[category] || [];
};

// Función existente para obtener producto por ID
export function getProductById(productId) {
    for (const category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

export const getProductsByCategoryRoute = (categoryKey) => {
    // Mapeo de URLs del navbar a keys del objeto products
    const routeToCategoryMap = {
        'individuales': 'individuales',
        'cuadradas': 'cuadradas',
        'circulares': 'circulares',
        'especiales': 'especiales',
        'sin_azucar': 'sin_azucar',
        'sin_gluten': 'sin_gluten',
        'veganos': 'veganos',
        'tradicional': 'tradicional'
    };

    const category = routeToCategoryMap[categoryKey];
    return products[category] || [];
};