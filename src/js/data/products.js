// Datos de productos organizados por categorías
export const products = {
    individuales: [
        {
            id: 'PI001',
            name: 'Mousse de Chocolate',
            description: 'Postre individual cremoso y suave, hecho con chocolate de alta calidad, ideal para los amantes del chocolate.',
            price: '$5.000',
            image: '/src/assets/images/mousse_de_chocolate.jpg',
            category: 'individuales'
        },
        {
            id: 'PI002',
            name: 'Tiramisú Clásico',
            description: 'Un postre italiano individual con capas de café, mascarpone y cacao, perfecto para finalizar cualquier comida.',
            price: '$5.500',
            image: '/src/assets/images/tiramisu_clasico.jpg',
            category: 'individuales'
        }
    ],
    sin_azucar: [
        {
            id: 'PSA001',
            name: 'Torta Sin Azúcar de Naranja',
            description: 'Torta ligera y deliciosa, endulzada naturalmente, ideal para quienes buscan opciones más saludables.',
            price: '$48.000',
            image: '/src/assets/images/torta_sin_azucar_de_naranja.png',
            category: 'sin_azucar'
        },
        {
            id: 'PSA002',
            name: 'Cheesecake Sin Azúcar',
            description: 'Suave y cremoso, este cheesecake es una opción perfecta para disfrutar sin culpa.',
            price: '$47.000',
            image: '/src/assets/images/cheesecake_sin_azucar.png',
            category: 'sin_azucar'
        }
    ],
    sin_gluten: [
        {
            id: 'PG001',
            name: 'Brownie Sin Gluten',
            description: 'Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten sin sacrificar el sabor.',
            price: '$4.000',
            image: '/src/assets/images/brownie_sin_gluten.jpg',
            category: 'sin_gluten'
        },
        {
            id: 'PG002',
            name: 'Pan Sin Gluten',
            description: 'Suave y esponjoso, ideal para sándwiches o para acompañar cualquier comida.',
            price: '$3.500',
            image: '/src/assets/images/pan_sin_gluten.jpg',
            category: 'sin_gluten'
        }
    ],
    veganos: [
        {
            id: 'PV001',
            name: 'Torta Vegana de Chocolate',
            description: 'Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal, perfecta para veganos.',
            price: '$50.000',
            image: '/src/assets/images/torta_vegana_de_chocolate.jpg',
            category: 'veganos'
        },
        {
            id: 'PV002',
            name: 'Galletas Veganas de Avena',
            description: 'Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable y vegano.',
            price: '$4.500',
            image: '/src/assets/images/galletas_veganas_de_avena.jpg',
            category: 'veganos'
        }
    ],
    circulares: [
        {
            id: 'TC001',
            name: 'Torta Circular de Vainilla',
            description: 'Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce, perfecto para cualquier ocasión.',
            price: '$40.000',
            image: '/src/assets/images/torta_circular_de_vainilla.jpg',
            category: 'circulares'
        },
        {
            id: 'TC002',
            name: 'Torta Circular de Manjar',
            description: 'Torta tradicional chilena con manjar y nueces, un deleite para los amantes de los sabores dulces y clásicos.',
            price: '$42.000',
            image: '/src/assets/images/torta_circular_de_manjar.jpg',
            category: 'circulares'
        }
    ],
    cuadradas: [
        {
            id: 'TQ001',
            name: 'Torta Cuadrada de Chocolate',
            description: 'Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.',
            price: '$45.000',
            image: '/src/assets/images/torta_cuadrada_de_chocolate.png',
            category: 'cuadradas'
        },
        {
            id: 'TQ002',
            name: 'Torta Cuadrada de Frutas',
            description: 'Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones.',
            price: '$50.000',
            image: '/src/assets/images/torta_cuadrada_de_frutas.png',
            category: 'cuadradas'
        }
    ],
    especiales: [
        {
            id: 'TE001',
            name: 'Torta Especial de Cumpleaños',
            description: 'Diseñada especialmente para celebraciones, personalizable con decoraciones y mensajes únicos.',
            price: '$55.000',
            image: '/src/assets/images/torta_especial_de_cumpleanos.png',
            category: 'especiales'
        },
        {
            id: 'TE002',
            name: 'Torta Especial de Boda',
            description: 'Elegante y deliciosa, esta torta está diseñada para ser el centro de atención en cualquier boda.',
            price: '$60.000',
            image: '/src/assets/images/torta_especial_de_boda.png',
            category: 'especiales'
        }
    ],
    tradicional: [
        {
            id: 'PT001',
            name: 'Empanada de Manzana',
            description: 'Pastelería tradicional rellena de manzanas especiadas, perfecta para un dulce desayuno o merienda.',
            price: '$3.000',
            image: '/src/assets/images/empanadas_de_manzana.jpg',
            category: 'tradicional'
        },
        {
            id: 'PT002',
            name: 'Tarta de Santiago',
            description: 'Tradicional tarta española hecha con almendras, azúcar, y huevos, una delicia para los amantes de los postres clásicos.',
            price: '$6.000',
            image: '/src/assets/images/tarta_de_santiago.jpg',
            category: 'tradicional'
        }
    ]
};

export function getProductsByCategory(category) {
    return products[category] || [];
}

export function getProductById(productId) {
    for (const category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}