export const orders = [];

export const createOrder = (orderData) => {
  const newOrder = {
    id: `ORD-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'confirmado',
    ...orderData
  };
  
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder;
};

export const getOrders = () => {
  return JSON.parse(localStorage.getItem('orders')) || [];
};