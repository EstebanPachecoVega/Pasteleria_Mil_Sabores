// src/data/users.js
export const users = JSON.parse(localStorage.getItem('users')) || [];

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
  SENIOR: 50 // Descuento para mayores de 50 años
};

// Crear usuario
export const createUser = (userData) => {
  const newUser = {
    id: `USER-${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: userTypes.REGULAR,
    orders: [],
    ...userData
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

// Buscar usuario por email
export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Buscar usuario por ID
export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

// Actualizar usuario
export const updateUser = (userId, updates) => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    return users[userIndex];
  }
  return null;
};

// Agregar pedido al usuario
export const addOrderToUser = (userId, order) => {
  const user = findUserById(userId);
  if (user) {
    if (!user.orders) user.orders = [];
    user.orders.unshift(order);    
    updateUser(userId, user);
    return user;
  }
  return null;
};

// Obtener descuento por tipo de usuario
export const getUserDiscount = (userType) => {
  return userDiscounts[userType] || 0;
};

// NUEVA función para verificar descuentos especiales
export const getSpecialDiscounts = (user) => {
  const discounts = {
    seniorDiscount: false,
    birthdayDiscount: false,
    codeDiscount: false
  };

  if (user) {
    // Verificar descuento por edad (mayores de 50 años)
    if (user.birthDate) {
      const birthDate = new Date(user.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      discounts.seniorDiscount = age >= 50;
    }

    // Verificar descuento por código FELICES50
    discounts.codeDiscount = user.discountCode === 'FELICES50';

    // Verificar descuento de cumpleaños para estudiantes Duoc
    if (user.email && user.email.includes('@duoc.cl') && user.birthDate) {
      const today = new Date();
      const birthDate = new Date(user.birthDate);
      discounts.birthdayDiscount = 
        today.getMonth() === birthDate.getMonth() && 
        today.getDate() === birthDate.getDate();
    }
  }

  return discounts;
};

// NUEVA función para calcular descuentos totales
export const calculateUserDiscounts = (user, subtotal) => {
  const specialDiscounts = getSpecialDiscounts(user);
  const typeDiscount = getUserDiscount(user?.type);
  let totalDiscount = typeDiscount;
  let discountDetails = [];

  // Aplicar descuentos especiales
  if (specialDiscounts.seniorDiscount) {
    totalDiscount = Math.max(totalDiscount, 50); // 50% para mayores de 50
    discountDetails.push('50% descuento para mayores de 50 años');
  }

  if (specialDiscounts.codeDiscount) {
    const codeDiscount = 10;
    totalDiscount += codeDiscount; // 10% adicional por código
    discountDetails.push('10% descuento por código FELICES50');
  }

  if (specialDiscounts.birthdayDiscount) {
    discountDetails.push('Torta gratis en tu cumpleaños');
  }

  const discountAmount = (subtotal * totalDiscount) / 100;

  return {
    totalDiscount,
    discountAmount,
    discountDetails,
    specialDiscounts
  };
};