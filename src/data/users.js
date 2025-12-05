import { obtenerProductoPorId } from '../services/productService';

export const getSpecialDiscounts = async (currentUser) => {
  if (!currentUser) return {};
  
  const discounts = {
    seniorDiscount: false,
    codeDiscount: false,
    birthdayDiscount: false
  };
  
  // 1. Calcular edad desde birthDate
  if (currentUser.birthDate) {
    const birthDate = new Date(currentUser.birthDate);
    const today = new Date();
    let userAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      userAge--;
    }
    
    console.log('📅 Edad calculada desde birthDate:', userAge, 'años');
    
    if (userAge >= 50) {
      discounts.seniorDiscount = true;
    }
  }
  
  // 2. Descuento por código (verificar en localStorage también)
  const discountCode = localStorage.getItem('discountCode');
  const hasCodeDiscount = currentUser.discountCode === 'FELICES50' || discountCode === 'FELICES50';
  
  if (hasCodeDiscount) {
    discounts.codeDiscount = true;
  }
  
  // 3. Descuento por cumpleaños
  if (currentUser.birthDate) {
    const birthDate = new Date(currentUser.birthDate);
    const today = new Date();
    
    const isBirthday = 
      today.getMonth() === birthDate.getMonth() && 
      today.getDate() === birthDate.getDate();
    
    // Verificar si es estudiante Duoc
    const isDuocStudent = currentUser.email && currentUser.email.includes('@duoc.cl');
    
    if (isBirthday && isDuocStudent) {
      discounts.birthdayDiscount = true;
    } else if (isBirthday && currentUser.rol === 'premium') {
      discounts.birthdayDiscount = true;
    }
  }
  
  return discounts;
};

// Función para calcular descuentos del usuario
export const calculateUserDiscounts = async (currentUser, subtotal, cartItems = []) => {
  if (!currentUser) {
    return {
      specialDiscounts: {},
      totalDiscount: 0,
      discountAmount: 0,
      discountDetails: []
    };
  }
  
  const specialDiscounts = await getSpecialDiscounts(currentUser);
  let discountAmount = 0;
  const discountDetails = [];
  
  // Descuento por tipo de usuario
  const userTypeDiscounts = {
    regular: 0,
    premium: 10,
    institutional: 15,
    admin: 20
  };
  
  const typeDiscount = userTypeDiscounts[currentUser.type] || 0;
  if (typeDiscount > 0) {
    discountAmount += (subtotal * typeDiscount) / 100;
    discountDetails.push(`${typeDiscount}% descuento (${currentUser.type})`);
  }
  
  // Descuento por edad (mayor de 50 años) - 50%
  if (specialDiscounts.seniorDiscount) {
    const seniorDiscountAmount = subtotal * 0.5;
    discountAmount += seniorDiscountAmount;
    discountDetails.push('50% descuento para mayores de 50 años');
  }
  
  // Descuento por código - 10%
  if (specialDiscounts.codeDiscount) {
    const codeDiscountAmount = subtotal * 0.1;
    discountAmount += codeDiscountAmount;
    discountDetails.push('10% descuento por código FELICES50');
  }
  
  // Descuento por cumpleaños (torta gratis)
  if (specialDiscounts.birthdayDiscount && cartItems && cartItems.length > 0) {
    // Buscar tortas en el carrito
    const cakes = cartItems.filter(item => 
      (item.categoryName && item.categoryName.toLowerCase().includes('torta')) || 
      (item.name && item.name.toLowerCase().includes('torta')) ||
      (item.category && item.category.toLowerCase().includes('torta'))
    );
    
    if (cakes.length > 0) {
      // Ordenar por precio y tomar la más barata
      const sortedCakes = [...cakes].sort((a, b) => (a.price || 0) - (b.price || 0));
      const cheapestCake = sortedCakes[0];
      
      const cakePrice = cheapestCake.price || 0;
      const cakeQuantity = cheapestCake.quantity || 1;
      discountAmount += cakePrice * cakeQuantity;
      discountDetails.push(`Torta gratis en tu cumpleaños (${cheapestCake.name})`);
    }
  }
  
  return {
    specialDiscounts,
    totalDiscount: discountAmount,
    discountAmount,
    discountDetails
  };
};

// Funciones para manejar usuarios desde Firebase
export const userTypes = {
  REGULAR: 'regular',
  PREMIUM: 'premium', 
  INSTITUTIONAL: 'institutional',
  ADMIN: 'admin'
};

export const userDiscounts = {
  [userTypes.REGULAR]: 0,
  [userTypes.PREMIUM]: 10,
  [userTypes.INSTITUTIONAL]: 15,
  [userTypes.ADMIN]: 20,
  SENIOR: 50 
};

// Cargar usuario por email desde Firebase
export const loadUserByEmail = async (email) => {
  try {
    const { findUserByEmail } = await import('../services/firestoreService');
    return await findUserByEmail(email);
  } catch (error) {
    console.error('Error cargando usuario por email:', error);
    return null;
  }
};

// Cargar usuario por ID desde Firebase
export const loadUserById = async (id) => {
  try {
    const { findUserById } = await import('../services/firestoreService');
    return await findUserById(id);
  } catch (error) {
    console.error('Error cargando usuario por ID:', error);
    return null;
  }
};

// Crear usuario en Firebase
export const createNewUser = async (userData) => {
  try {
    const { addUser } = await import('../services/firestoreService');
    const newUser = {
      id: `USER-${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: userTypes.REGULAR,
      orders: [],
      ...userData
    };
    
    const result = await addUser(newUser);
    return result;
  } catch (error) {
    console.error('Error creando usuario en Firebase:', error);
    throw error;
  }
};

// Obtener descuento por tipo de usuario
export const getUserDiscount = (userType) => {
  return userDiscounts[userType] || 0;
};

// Cargar productos para el carrito con stock actualizado
export const loadProductsWithStock = async (cartItems) => {
  try {
    const productsWithStock = [];
    
    for (const item of cartItems) {
      try {
        const producto = await obtenerProductoPorId(item.id);
        productsWithStock.push({
          ...item,
          stock: producto?.stock || 0,
          maxStock: producto?.stock || 0
        });
      } catch (error) {
        console.error(`Error cargando stock para ${item.id}:`, error);
        productsWithStock.push({
          ...item,
          stock: 0,
          maxStock: 0
        });
      }
    }
    
    return productsWithStock;
  } catch (error) {
    console.error('Error cargando productos con stock:', error);
    return cartItems;
  }
};

// Función auxiliar para calcular edad
export const calculateUserAge = (birthDateString) => {
  if (!birthDateString) return 0;
  
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Función auxiliar para verificar si es cumpleaños
export const isUserBirthdayToday = (birthDateString) => {
  if (!birthDateString) return false;
  
  const birthDate = new Date(birthDateString);
  const today = new Date();
  
  return today.getMonth() === birthDate.getMonth() && 
         today.getDate() === birthDate.getDate();
};

// Función para actualizar usuario localmente (para compatibilidad)
export const updateUserData = async (userId, updates) => {
  try {
    const { updateUser } = await import('../services/firestoreService');
    return await updateUser(userId, updates);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return null;
  }
};

// Función para agregar orden al usuario
export const addOrderToUserData = async (userId, order) => {
  try {
    const user = await loadUserById(userId);
    if (user) {
      if (!user.orders) user.orders = [];
      user.orders.unshift(order);
      
      // Actualizar en Firebase
      const { updateUser } = await import('../services/firestoreService');
      return await updateUser(userId, { orders: user.orders });
    }
    return null;
  } catch (error) {
    console.error('Error agregando orden al usuario:', error);
    return null;
  }
};