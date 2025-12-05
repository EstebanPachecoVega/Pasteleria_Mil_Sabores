export const getSpecialDiscounts = (currentUser) => {
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
export const calculateUserDiscounts = (currentUser, subtotal, cartItems = []) => {
  if (!currentUser) {
    return {
      specialDiscounts: {},
      totalDiscount: 0,
      discountAmount: 0,
      discountDetails: []
    };
  }
  
  const specialDiscounts = getSpecialDiscounts(currentUser);
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

// Funciones existentes
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
  SENIOR: 50 
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