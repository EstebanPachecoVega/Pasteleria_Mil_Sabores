// scripts/createCategoriesFirebase.js
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
const crearSlugCategoria = (nombre) => {
  if (!nombre) return '';
  
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, '')    // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-');          // Espacios a guiones
};

const crearCategorias = async () => {
  try {
    console.log('🚀 Iniciando creación de categorías...\n');
    
    // Datos de categorías a crear (basados en tus datos)
    const categorias = [
      {
        id: 'cat_individuales',
        nombre: 'Individuales',
        descripcion: 'Deliciosos postres en porciones individuales, perfectos para un gusto personal',
        orden: 1,
        activa: true,
        createdAt: new Date('2025-10-24T20:49:00-03:00'),
        updatedAt: new Date('2025-10-24T20:49:00-03:00')
      },
      {
        id: 'cat_sin_azucar',
        nombre: 'Sin Azúcar',
        descripcion: 'Postres saludables sin azúcar añadida, ideales para dietas especiales',
        orden: 2,
        activa: true,
        createdAt: new Date('2025-10-24T20:49:00-03:00'),
        updatedAt: new Date('2025-10-24T20:49:00-03:00')
      },
      {
        id: 'cat_sin_gluten',
        nombre: 'Sin Gluten',
        descripcion: 'Postres aptos para celíacos y personas sensibles al gluten',
        orden: 3,
        activa: true,
        createdAt: new Date('2025-10-24T20:49:00-03:00'),
        updatedAt: new Date('2025-10-24T20:49:00-03:00')
      },
      {
        id: 'cat_veganos',
        nombre: 'Veganos',
        descripcion: 'Elaborados sin productos de origen animal, para una dieta vegana',
        orden: 4,
        activa: true,
        createdAt: new Date('2025-10-24T20:51:00-03:00'),
        updatedAt: new Date('2025-10-24T20:51:00-03:00')
      },
      {
        id: 'cat_circulares',
        nombre: 'Tortas Circulares',
        descripcion: 'Tortas clásicas en forma circular, ideales para celebraciones',
        orden: 5,
        activa: true,
        createdAt: new Date('2025-10-24T20:53:00-03:00'),
        updatedAt: new Date('2025-10-24T20:53:00-03:00')
      },
      {
        id: 'cat_cuadradas',
        nombre: 'Tortas Cuadradas',
        descripcion: 'Tortas en forma cuadrada, perfectas para eventos formales',
        orden: 6,
        activa: true,
        createdAt: new Date('2025-10-24T20:55:00-03:00'),
        updatedAt: new Date('2025-10-24T20:55:00-03:00')
      },
      {
        id: 'cat_especiales',
        nombre: 'Tortas Especiales',
        descripcion: 'Tortas para ocasiones especiales como cumpleaños y bodas',
        orden: 7,
        activa: true,
        createdAt: new Date('2025-10-24T20:57:00-03:00'),
        updatedAt: new Date('2025-10-24T20:57:00-03:00')
      },
      {
        id: 'cat_tradicionales',
        nombre: 'Tradicionales',
        descripcion: 'Postres clásicos y de la tradición pastelera',
        orden: 8,
        activa: true,
        createdAt: new Date('2025-10-24T20:59:00-03:00'),
        updatedAt: new Date('2025-10-24T20:59:00-03:00')
      }
    ];

    let creadas = 0;
    let errores = 0;

    for (const categoriaData of categorias) {
      try {
        // Crear slug a partir del nombre
        const slug = crearSlugCategoria(categoriaData.nombre);
        
        // Datos completos de la categoría
        const categoriaCompleta = {
          ...categoriaData,
          slug: slug,
          activa: true
        };

        // Crear documento en Firebase
        const categoriaRef = doc(db, "categoria", categoriaData.id);
        await setDoc(categoriaRef, categoriaCompleta);
        
        console.log(`✅ Categoría creada: ${categoriaData.nombre}`);
        console.log(`   ID: ${categoriaData.id}`);
        console.log(`   Slug: ${slug}`);
        console.log(`   Orden: ${categoriaData.orden}`);
        console.log(`   URL: /categoria/${slug}\n`);
        
        creadas++;
        
      } catch (error) {
        console.error(`❌ Error creando categoría ${categoriaData.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n📊 RESUMEN DE CREACIÓN:');
    console.log(`✅ Categorías creadas: ${creadas}`);
    console.log(`❌ Errores: ${errores}`);
    
    if (errores === 0) {
      console.log('🎉 ¡Todas las categorías creadas exitosamente!');
      console.log('\n📋 URLs disponibles en tu aplicación:');
      categorias.forEach((cat, index) => {
        const slug = crearSlugCategoria(cat.nombre);
        console.log(`${index + 1}. http://localhost:3000/categoria/${slug}`);
      });
    }

    // Dar instrucciones adicionales
    console.log('\n🔧 PASOS SIGUIENTES:');
    console.log('1. Verifica en Firebase Console que las categorías se crearon');
    console.log('2. Ejecuta la migración de productos (opcional)');
    console.log('3. Reinicia tu aplicación React');
    console.log('4. Navega a /categoria/sin-gluten para probar');

  } catch (error) {
    console.error('❌ Error en la creación de categorías:', error);
    console.error('💡 Solución: Verifica que Firebase esté correctamente configurado y que tengas permisos de escritura.');
  }
};

// Ejecutar script
crearCategorias().then(() => {
  console.log('\n✨ Script completado.');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});