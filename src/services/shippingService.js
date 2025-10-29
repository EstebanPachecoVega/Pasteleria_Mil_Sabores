import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// =============================================
// CONFIGURACIÓN POR DEFECTO (backup)
// =============================================
const defaultShippingZones = {
  ZONA_RM: {
    regionId: ["13"],
    costoBase: 2500,
    costoGratisDesde: 40000,
    name: "Región Metropolitana",
    zona: "ZONA_RM",
    color: "success",
    icon: "bi bi-buildings"
  },
  ZONA_CENTRO: {
    regionId: ["5", "6", "7"],
    costoBase: 3000,
    costoGratisDesde: 45000,
    name: "Zona Centro", 
    zona: "ZONA_CENTRO",
    color: "info",
    icon: "bi bi-geo-alt"
  },
  ZONA_SUR: {
    regionId: ["8", "9", "10", "14", "16", "11", "12"],
    costoBase: 4000,
    costoGratisDesde: 45000,
    name: "Zona Sur",
    zona: "ZONA_SUR",
    color: "primary",
    icon: "bi bi-tree"
  },
  ZONA_NORTE: {
    regionId: ["15", "1", "2", "3", "4"],
    costoBase: 4000,
    costoGratisDesde: 45000,
    name: "Zona Norte",
    zona: "ZONA_NORTE",
    color: "warning",
    icon: "bi bi-sun"
  }
};

// =============================================
// FUNCIONES PRINCIPALES
// =============================================

// Obtener todos los costos de envío de Firebase
export const getAllShippingCosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "costo_envio"));
    const shippingCosts = [];
    
    querySnapshot.forEach((doc) => {
      shippingCosts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return shippingCosts;
  } catch (error) {
    console.error("Error obteniendo costos de envío:", error);
    throw error;
  }
};

// Obtener costo de envío para una región específica
export const getShippingCostByRegion = async (regionId) => {
  try {
    // Obtener todos los costos de Firebase
    const allCosts = await getAllShippingCosts();
    
    // Buscar la configuración que incluya esta región en su array regionId
    for (const cost of allCosts) {
      if (cost.regionId && cost.regionId.includes(regionId)) {
        return {
          ...cost,
          color: getColorByZone(cost.zona),
          icon: getIconByZone(cost.zona)
        };
      }
    }
    
    // Si no encuentra en Firebase, usar configuración por defecto
    return getDefaultShippingForRegion(regionId);
    
  } catch (error) {
    console.error("Error obteniendo costo por región:", error);
    return getDefaultShippingForRegion(regionId);
  }
};

// Calcular costo de envío para checkout (FUNCIÓN PRINCIPAL)
export const calculateShippingCost = async (regionId, subtotal) => {
  try {
    const shippingConfig = await getShippingCostByRegion(regionId);
    
    const esGratis = subtotal >= shippingConfig.costoGratisDesde;
    const costo = esGratis ? 0 : shippingConfig.costoBase;
    const faltante = esGratis ? 0 : Math.max(0, shippingConfig.costoGratisDesde - subtotal);
    
    return {
      costo,
      esGratis,
      config: shippingConfig,
      mensaje: esGratis 
        ? `¡Envío GRATIS para ${shippingConfig.name}!`
        : `Envío: $${costo.toLocaleString()} - Gratis desde $${shippingConfig.costoGratisDesde.toLocaleString()}`,
      faltante
    };
    
  } catch (error) {
    console.error("Error calculando envío:", error);
    // Fallback a configuración por defecto
    const defaultConfig = getDefaultShippingForRegion(regionId);
    const esGratis = subtotal >= defaultConfig.costoGratisDesde;
    const costo = esGratis ? 0 : defaultConfig.costoBase;
    
    return {
      costo,
      esGratis,
      config: defaultConfig,
      mensaje: `Envío: $${costo.toLocaleString()} - Gratis desde $${defaultConfig.costoGratisDesde.toLocaleString()}`,
      faltante: esGratis ? 0 : Math.max(0, defaultConfig.costoGratisDesde - subtotal)
    };
  }
};

// =============================================
// FUNCIONES ADMINISTRATIVAS
// =============================================

// Crear o actualizar costo de envío
export const saveShippingCost = async (shippingData) => {
  try {
    // Verificar si ya existe configuración para estas regiones
    const existingCosts = await getAllShippingCosts();
    const existing = existingCosts.find(cost => 
      JSON.stringify(cost.regionId) === JSON.stringify(shippingData.regionId)
    );
    
    if (existing) {
      // Actualizar documento existente
      await updateDoc(doc(db, "costo_envio", existing.id), {
        ...shippingData,
        updatedAt: new Date()
      });
      return { id: existing.id, ...shippingData };
    } else {
      // Crear nuevo documento
      const docRef = await addDoc(collection(db, "costo_envio"), {
        ...shippingData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...shippingData };
    }
  } catch (error) {
    console.error("Error guardando costo de envío:", error);
    throw error;
  }
};

// Eliminar costo de envío
export const deleteShippingCost = async (shippingId) => {
  try {
    await deleteDoc(doc(db, "costo_envio", shippingId));
    return true;
  } catch (error) {
    console.error("Error eliminando costo de envío:", error);
    throw error;
  }
};

// =============================================
// FUNCIONES HELPER
// =============================================

const getDefaultShippingForRegion = (regionId) => {
  for (const [zoneKey, zoneConfig] of Object.entries(defaultShippingZones)) {
    if (zoneConfig.regionId.includes(regionId)) {
      return {
        ...zoneConfig
      };
    }
  }
  // Default a Zona Sur si no encuentra
  return defaultShippingZones.ZONA_SUR;
};

const getColorByZone = (zona) => {
  const colors = {
    'ZONA_RM': 'success',
    'ZONA_CENTRO': 'info', 
    'ZONA_SUR': 'primary',
    'ZONA_NORTE': 'warning'
  };
  return colors[zona] || 'secondary';
};

const getIconByZone = (zona) => {
  const icons = {
    'ZONA_RM': 'bi bi-buildings',
    'ZONA_CENTRO': 'bi bi-geo-alt',
    'ZONA_SUR': 'bi bi-tree',
    'ZONA_NORTE': 'bi bi-sun'
  };
  return icons[zona] || 'bi bi-truck';
};

// Obtener todas las zonas disponibles
export const getAllShippingZones = () => {
  return defaultShippingZones;
};