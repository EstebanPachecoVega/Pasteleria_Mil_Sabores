export const orders = [];

// MODIFICAR la función createOrder
export const createOrder = (orderData) => {
  const newOrder = {
    id: `ORD-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'confirmado',
    userId: orderData.userId, // ← NUEVO: ID del usuario
    userName: orderData.userName, // ← NUEVO: Nombre del usuario
    userEmail: orderData.userEmail, // ← NUEVO: Email del usuario
    ...orderData
  };
  
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder;
};

export const getOrders = () => {
  return JSON.parse(localStorage.getItem('orders')) || [];
};