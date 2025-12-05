// scripts/createProductsFirebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Usar la misma configuración que tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyDF9JD8hX8acLtwlvoPMSY0l0WFKTsP1-s",
  authDomain: "pasteleriamilsabores-f1a02.firebaseapp.com",
  databaseURL: "https://pasteleriamilsabores-f1a02-default-rtdb.firebaseio.com",
  projectId: "pasteleriamilsabores-f1a02",
  storageBucket: "pasteleriamilsabores-f1a02.appspot.com",
  messagingSenderId: "676700241433",
  appId: "1:676700241433:web:e864c4c9c04765f2063488",
  measurementId: "G-HEF65DDB2C"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para crear slug
const crearSlugProducto = (nombre) => {
  if (!nombre) return '';
  
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, '')    // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-');          // Espacios a guiones
};

// Función para mapear nombres de categoría a IDs de categoría
const obtenerCategoriaId = (nombreCategoria) => {
  const categoriasMap = {
    "Sin Gluten": "cat_sin_gluten",
    "Individuales": "cat_individuales",
    "Sin Azúcar": "cat_sin_azucar",
    "Tradicionales": "cat_tradicionales",
    "Veganos": "cat_veganos",
    "Tortas Circulares": "cat_circulares",
    "Tortas Especiales": "cat_especiales",
    "Tortas Cuadradas": "cat_cuadradas"
  };
  
  return categoriasMap[nombreCategoria] || null;
};

const crearProductos = async () => {
  try {
    console.log('🚀 Iniciando creación de productos...\n');
    
    // Datos de productos a crear
    const productos = [
      {
        id: 'PG001',
        nombre: 'Brownie Sin Gluten',
        descripcion: 'Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten sin sacrificar el sabor.',
        categoria: 'Sin Gluten',
        precio: 4000,
        stock: 12,
        image: '/images/productos/brownie_sin_gluten.png',
        images: [
          '/images/productos/brownie_sin_gluten.png',
          '/images/productos/brownie_sin_gluten_2.png',
          '/images/productos/brownie_sin_gluten_3.png',
          '/images/productos/brownie_sin_gluten_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:05:00-03:00'),
        updatedAt: new Date('2025-11-25T10:07:07-03:00')
      },
      {
        id: 'PG002',
        nombre: 'Pan Sin Gluten',
        descripcion: 'Suave y esponjoso, ideal para sándwiches o para acompañar cualquier comida.',
        categoria: 'Sin Gluten',
        precio: 3500,
        stock: 22,
        image: '/images/productos/pan_sin_gluten.png',
        images: [
          '/images/productos/pan_sin_gluten.png',
          '/images/productos/pan_sin_gluten_2.png',
          '/images/productos/pan_sin_gluten_3.png',
          '/images/productos/pan_sin_gluten_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:07:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:03-03:00')
      },
      {
        id: 'PI001',
        nombre: 'Mousse de Chocolate',
        descripcion: 'Postre individual cremoso y suave, hecho con chocolate de alta calidad, ideal para los amantes del chocolate.',
        categoria: 'Individuales',
        precio: 5000,
        stock: 47,
        image: '/images/productos/mousse_de_chocolate.png',
        images: [
          '/images/productos/mousse_de_chocolate.png',
          '/images/productos/tiramisu_clasico.png',
          '/images/productos/torta_sin_azucar_de_naranja.png',
          '/images/productos/cheesecake_sin_azucar.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T17:49:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:11-03:00')
      },
      {
        id: 'PI002',
        nombre: 'Tiramisú Clásico',
        descripcion: 'Un postre italiano individual con capas de café, mascarpone y cacao, perfecto para finalizar cualquier comida.',
        categoria: 'Individuales',
        precio: 5500,
        stock: 40,
        image: '/images/productos/tiramisu_clasico.png',
        images: [
          '/images/productos/tiramisu_clasico.png',
          '/images/productos/tiramisu_clasico_2.png',
          '/images/productos/tiramisu_clasico_3.png',
          '/images/productos/tiramisu_clasico_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T17:52:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:15-03:00')
      },
      {
        id: 'PSA001',
        nombre: 'Torta Sin Azúcar de Naranja',
        descripcion: 'Torta ligera y deliciosa, endulzada naturalmente, ideal para quienes buscan opciones más saludables.',
        categoria: 'Sin Azúcar',
        precio: 48000,
        stock: 5,
        image: '/images/productos/torta_sin_azucar_de_naranja.png',
        images: [
          '/images/productos/torta_sin_azucar_de_naranja.png',
          '/images/productos/torta_sin_azucar_de_naranja_2.png',
          '/images/productos/torta_sin_azucar_de_naranja_3.png',
          '/images/productos/torta_sin_azucar_de_naranja_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:00:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:23-03:00')
      },
      {
        id: 'PSA002',
        nombre: 'Cheesecake Sin Azúcar',
        descripcion: 'Suave y cremoso, este cheesecake es una opción perfecta para disfrutar sin culpa.',
        categoria: 'Sin Azúcar',
        precio: 47000,
        stock: 9,
        image: '/images/productos/cheesecake_sin_azucar.png',
        images: [
          '/images/productos/cheesecake_sin_azucar.png',
          '/images/productos/cheesecake_sin_azucar_2.png',
          '/images/productos/cheesecake_sin_azucar_3.png',
          '/images/productos/cheesecake_sin_azucar_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:02:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:31-03:00')
      },
      {
        id: 'PT001',
        nombre: 'Empanada de Manzana',
        descripcion: 'Pastelería tradicional rellena de manzanas especiadas, perfecta para un dulce desayuno o merienda.',
        categoria: 'Tradicionales',
        precio: 3000,
        stock: 29,
        image: '/images/productos/empanadas_de_manzana.png',
        images: [
          '/images/productos/empanadas_de_manzana.png',
          '/images/productos/empanadas_de_manzana_2.png',
          '/images/productos/empanadas_de_manzana_3.png',
          '/images/productos/empanadas_de_manzana_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:30:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:35-03:00')
      },
      {
        id: 'PT002',
        nombre: 'Tarta de Santiago',
        descripcion: 'Tradicional tarta española hecha con almendras, azúcar, y huevos, una delicia para los amantes de los postres clásicos.',
        categoria: 'Tradicionales',
        precio: 6000,
        stock: 11,
        image: '/images/productos/tarta_de_santiago.png',
        images: [
          '/images/productos/tarta_de_santiago.png',
          '/images/productos/tarta_de_santiago_2.png',
          '/images/productos/tarta_de_santiago_3.png',
          '/images/productos/tarta_de_santiago_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:32:00-03:00'),
        updatedAt: new Date('2025-11-25T10:13:44-03:00')
      },
      {
        id: 'PV001',
        nombre: 'Torta Vegana de Chocolate',
        descripcion: 'Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal, perfecta para veganos.',
        categoria: 'Veganos',
        precio: 50000,
        stock: 4,
        image: '/images/productos/torta_vegana_de_chocolate.png',
        images: [
          '/images/productos/torta_vegana_de_chocolate.png',
          '/images/productos/torta_vegana_de_chocolate_2.png',
          '/images/productos/torta_vegana_de_chocolate_3.png',
          '/images/productos/torta_vegana_de_chocolate_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:10:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:01-03:00')
      },
      {
        id: 'PV002',
        nombre: 'Galletas Veganas de Avena',
        descripcion: 'Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable y vegano.',
        categoria: 'Veganos',
        precio: 4500,
        stock: 17,
        image: '/images/productos/galletas_veganas_de_avena.png',
        images: [
          '/images/productos/galletas_veganas_de_avena.png',
          '/images/productos/galletas_veganas_de_avena_2.png',
          '/images/productos/galletas_veganas_de_avena_3.png',
          '/images/productos/galletas_veganas_de_avena_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:13:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:07-03:00')
      },
      {
        id: 'TC001',
        nombre: 'Torta Circular de Vainilla',
        descripcion: 'Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce, perfecto para cualquier ocasión.',
        categoria: 'Tortas Circulares',
        precio: 40000,
        stock: 6,
        image: '/images/productos/torta_circular_de_vainilla.png',
        images: [
          '/images/productos/torta_circular_de_vainilla.png',
          '/images/productos/torta_circular_de_vainilla_2.png',
          '/images/productos/torta_circular_de_vainilla_3.png',
          '/images/productos/torta_circular_de_vainilla_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:15:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:17-03:00')
      },
      {
        id: 'TC002',
        nombre: 'Torta Circular de Manjar',
        descripcion: 'Torta tradicional chilena con manjar y nueces, un deleite para los amantes de los sabores dulces y clásicos.',
        categoria: 'Tortas Circulares',
        precio: 42000,
        stock: 1,
        image: '/images/productos/torta_circular_de_manjar.png',
        images: [
          '/images/productos/torta_circular_de_manjar.png',
          '/images/productos/torta_circular_de_manjar_2.png',
          '/images/productos/torta_circular_de_manjar_3.png',
          '/images/productos/torta_circular_de_manjar_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:17:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:25-03:00')
      },
      {
        id: 'TE001',
        nombre: 'Torta Especial de Cumpleaños',
        descripcion: 'Diseñada especialmente para celebraciones, personalizable con decoraciones y mensajes únicos.',
        categoria: 'Tortas Especiales',
        precio: 55000,
        stock: 3,
        image: '/images/productos/torta_especial_de_cumpleanos.png',
        images: [
          '/images/productos/torta_especial_de_cumpleanos.png',
          '/images/productos/torta_especial_de_cumpleanos_2.png',
          '/images/productos/torta_especial_de_cumpleanos_3.png',
          '/images/productos/torta_especial_de_cumpleanos_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:24:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:30-03:00')
      },
      {
        id: 'TE002',
        nombre: 'Torta Especial de Boda',
        descripcion: 'Elegante y deliciosa, esta torta está diseñada para ser el centro de atención en cualquier boda.',
        categoria: 'Tortas Especiales',
        precio: 60000,
        stock: 2,
        image: '/images/productos/torta_especial_de_boda.png',
        images: [
          '/images/productos/torta_especial_de_boda.png',
          '/images/productos/torta_especial_de_boda_2.png',
          '/images/productos/torta_especial_de_boda_3.png',
          '/images/productos/torta_especial_de_boda_4.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:28:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:36-03:00')
      },
      {
        id: 'TQ001',
        nombre: 'Torta Cuadrada de Chocolate',
        descripcion: 'Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.',
        categoria: 'Tortas Cuadradas',
        precio: 45000,
        stock: 1,
        image: '/images/productos/torta_cuadrada_de_chocolate.png',
        images: [
          '/images/productos/torta_cuadrada_de_chocolate.png',
          '/images/productos/torta_cuadrada_de_chocolate_2.png'
        ],
        destacado: true,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:19:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:48-03:00')
      },
      {
        id: 'TQ002',
        nombre: 'Torta Cuadrada de Frutas',
        descripcion: 'Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones.',
        categoria: 'Tortas Cuadradas',
        precio: 50000,
        stock: 4,
        image: '/images/productos/torta_cuadrada_de_frutas.png',
        images: [
          '/images/productos/torta_cuadrada_de_frutas.png',
          '/images/productos/torta_cuadrada_de_frutas_2.png',
          '/images/productos/torta_cuadrada_de_frutas_3.png',
          '/images/productos/torta_cuadrada_de_frutas_4.png'
        ],
        destacado: false,
        novedad: false,
        activo: true,
        createdAt: new Date('2025-10-24T18:21:00-03:00'),
        updatedAt: new Date('2025-11-25T10:14:53-03:00')
      }
    ];

    let creados = 0;
    let errores = 0;

    for (const productoData of productos) {
      try {
        // Crear slug a partir del nombre
        const slug = crearSlugProducto(productoData.nombre);
        
        // Obtener categoriaId (SOLO EL ID, sin nombre)
        const categoriaId = obtenerCategoriaId(productoData.categoria);
        
        if (!categoriaId) {
          console.error(`❌ Error: No se encontró categoriaId para "${productoData.categoria}"`);
          errores++;
          continue;
        }

        // Datos completos del producto - SOLO categoriaId
        const productoCompleto = {
          id: productoData.id,
          nombre: productoData.nombre,
          descripcion: productoData.descripcion,
          categoriaId: categoriaId, // ← SOLO EL ID DE REFERENCIA
          precio: productoData.precio,
          stock: productoData.stock,
          image: productoData.image,
          images: productoData.images,
          destacado: productoData.destacado,
          novedad: productoData.novedad || false,
          activo: productoData.activo || true,
          slug: slug,
          createdAt: productoData.createdAt,
          updatedAt: productoData.updatedAt
        };

        // Crear documento en Firebase
        const productoRef = doc(db, "producto", productoData.id);
        await setDoc(productoRef, productoCompleto);
        
        console.log(`✅ Producto creado: ${productoData.nombre}`);
        console.log(`   ID: ${productoData.id}`);
        console.log(`   Slug: ${slug}`);
        console.log(`   Categoría ID: ${categoriaId}`);
        console.log(`   Relación: producto/${productoData.id} → categoria/${categoriaId}`);
        console.log(`   Precio: $${productoData.precio}`);
        console.log(`   Stock: ${productoData.stock} unidades\n`);
        
        creados++;
        
      } catch (error) {
        console.error(`❌ Error creando producto ${productoData.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n📊 RESUMEN DE CREACIÓN:');
    console.log(`✅ Productos creados: ${creados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📦 Total de productos: ${productos.length}`);
    
    // Mostrar resumen por tipo
    console.log('\n📋 TIPOS DE PRODUCTOS CREADOS:');
    console.log('   PG001, PG002  → Sin Gluten');
    console.log('   PI001, PI002  → Individuales');
    console.log('   PSA001, PSA002 → Sin Azúcar');
    console.log('   PT001, PT002  → Tradicionales');
    console.log('   PV001, PV002  → Veganos');
    console.log('   TC001, TC002  → Tortas Circulares');
    console.log('   TE001, TE002  → Tortas Especiales');
    console.log('   TQ001, TQ002  → Tortas Cuadradas');

    if (errores === 0) {
      console.log('\n🎉 ¡Todos los productos creados exitosamente!');
      console.log('\n🔗 ESTRUCTURA DE RELACIONES:');
      console.log('┌─────────────────────────────────────┐');
      console.log('│ producto/{id}                       │');
      console.log('│   • categoriaId: "cat_xxxxx"        │ ← REFERENCIA');
      console.log('│                                     │');
      console.log('│ categoria/{id}                      │');
      console.log('│   • id: "cat_xxxxx"                 │ ← DOCUMENTO');
      console.log('│   • nombre: "Nombre Categoría"      │');
      console.log('│   • slug: "nombre-categoria"        │');
      console.log('└─────────────────────────────────────┘');
      
      console.log('\n🔧 CÓMO USAR EN TU APLICACIÓN:');
      console.log('1. Obtén el producto de Firebase');
      console.log('2. Usa el campo "categoriaId" para buscar la categoría');
      console.log('3. Ejemplo de consulta combinada:');
      console.log(`
   // Obtener producto
   const producto = await getDoc(doc(db, "producto", "TC001"));
   
   // Obtener su categoría usando el categoriaId
   const categoria = await getDoc(
     doc(db, "categoria", producto.data().categoriaId)
   );
   
   // Ahora tienes:
   // - producto.data().nombre
   // - categoria.data().nombre
      `);
      
      console.log('\n📝 VENTAJAS DE ESTA ESTRUCTURA:');
      console.log('✅ Consistencia garantizada (solo un ID)');
      console.log('✅ Fácil actualizar nombres de categoría');
      console.log('✅ No hay datos duplicados');
      console.log('✅ Más escalable para el futuro');
    }

  } catch (error) {
    console.error('❌ Error en la creación de productos:', error);
    console.error('💡 Solución: Verifica que Firebase esté correctamente configurado.');
  }
};

// Ejecutar script
crearProductos().then(() => {
  console.log('\n✨ Script completado.');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});