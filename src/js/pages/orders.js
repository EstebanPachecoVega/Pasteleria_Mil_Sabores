import { AuthManager } from '../components/AuthManager.js';
import { getProductById } from '../data/products.js';

// Inicializar el gestor de autenticación
const authManager = new AuthManager();

// Estado de la aplicación
let currentOrders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 5;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!authManager.isLoggedIn()) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Pequeño delay para asegurar que los partials estén cargados
    setTimeout(() => {
        loadOrders();
        setupEventListeners();
    }, 100);
});

// Función para convertir precio string a número (ej: "$5.000" → 5000)
function parsePrice(priceString) {
    if (typeof priceString === 'number') return priceString;
    if (!priceString) return 0;
    return parseInt(priceString.replace(/\$\s?|\./g, '')) || 0;
}

// Función para obtener productos de muestra con precios actualizados
function getSampleOrderItems() {
    const products = [
        { id: 'PI001', quantity: 2 }, // Mousse de Chocolate
        { id: 'TC001', quantity: 1 }, // Torta Circular de Vainilla
        { id: 'PSA001', quantity: 1 } // Torta Sin Azúcar de Naranja
    ];

    return products.map(item => {
        const product = getProductById(item.id);
        return {
            id: item.id,
            name: product ? product.name : `Producto ${item.id}`,
            quantity: item.quantity,
            price: product ? parsePrice(product.price) : 0,
            image: product ? product.image : ''
        };
    });
}

// Función para crear órdenes de muestra con precios actualizados
function createSampleOrders(userId) {
    const items = getSampleOrderItems();
    
    const sampleOrders = [
        {
            id: 'ORD-' + Date.now(),
            userId: userId,
            date: new Date(),
            status: 'pending',
            total: items.slice(0, 2).reduce((sum, item) => sum + (item.price * item.quantity), 0),
            items: items.slice(0, 2), // Primeros 2 productos
            shippingAddress: 'Calle Principal 123, Santiago',
            shippingMethod: 'Estándar',
            discounts: 0
        },
        {
            id: 'ORD-' + (Date.now() - 86400000), // Hace 1 día
            userId: userId,
            date: new Date(Date.now() - 86400000),
            status: 'processing',
            total: items[2].price * items[2].quantity, // Tercer producto
            items: [items[2]], // Solo el tercer producto
            shippingAddress: 'Calle Principal 123, Santiago',
            shippingMethod: 'Express',
            discounts: 0
        }
    ];
    
    localStorage.setItem(`orders_${userId}`, JSON.stringify(sampleOrders));
    return sampleOrders;
}

function loadOrders() {
    const user = authManager.getCurrentUser();
    if (!user) return;

    let orders = getOrdersFromStorage(user.id);
    
    // Si no hay órdenes, crear algunas de muestra
    if (!orders || orders.length === 0) {
        orders = createSampleOrders(user.id);
    }
    
    if (orders && orders.length > 0) {
        currentOrders = orders;
        filteredOrders = [...currentOrders];
        renderOrders();
        updatePagination();
    } else {
        showNoOrdersMessage();
    }
}

function getOrdersFromStorage(userId) {
    try {
        const orders = JSON.parse(localStorage.getItem(`orders_${userId}`)) || [];
        return orders.map(order => ({
            ...order,
            date: new Date(order.date)
        }));
    } catch (error) {
        console.error('Error loading orders from storage:', error);
        return [];
    }
}

function setupEventListeners() {
    // Filtros
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-date').addEventListener('change', applyFilters);
    
    // Búsqueda
    document.getElementById('search-orders').addEventListener('input', applyFilters);
    
    // Botón de búsqueda
    document.querySelector('#search-orders + button').addEventListener('click', applyFilters);
}

function applyFilters() {
    const statusFilter = document.getElementById('filter-status').value;
    const dateFilter = document.getElementById('filter-date').value;
    const searchTerm = document.getElementById('search-orders').value.toLowerCase();
    
    filteredOrders = currentOrders.filter(order => {
        // Filtrar por estado
        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }
        
        // Filtrar por fecha
        if (dateFilter !== 'all') {
            const now = new Date();
            const orderDate = new Date(order.date);
            
            switch (dateFilter) {
                case 'month':
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    if (orderDate < monthAgo) return false;
                    break;
                case '3months':
                    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
                    if (orderDate < threeMonthsAgo) return false;
                    break;
                case 'year':
                    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                    if (orderDate < yearAgo) return false;
                    break;
            }
        }
        
        // Filtrar por término de búsqueda
        if (searchTerm) {
            const matchesId = order.id.toLowerCase().includes(searchTerm);
            const matchesProduct = order.items.some(item => 
                item.name.toLowerCase().includes(searchTerm)
            );
            
            if (!matchesId && !matchesProduct) return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    renderOrders();
    updatePagination();
}

function renderOrders() {
    const ordersContainer = document.getElementById('orders-container');
    const pagination = document.getElementById('orders-pagination');
    
    if (filteredOrders.length === 0) {
        showNoOrdersMessage();
        pagination.classList.add('d-none');
        return;
    }
    
    // Calcular órdenes para la página actual
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrdersPage = filteredOrders.slice(startIndex, endIndex);
    
    // Generar HTML de las órdenes
    ordersContainer.innerHTML = currentOrdersPage.map(order => `
        <div class="card shadow-sm mb-3 order-card" data-order-id="${order.id}">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <h6 class="card-title mb-1">Pedido #${order.id}</h6>
                        <small class="text-muted">${formatDate(order.date)}</small>
                    </div>
                    <div class="col-md-2">
                        <span class="badge ${getStatusBadgeClass(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                    <div class="col-md-2">
                        <strong>${formatCurrency(order.total)}</strong>
                    </div>
                    <div class="col-md-3">
                        <small>${order.items.length} producto(s)</small>
                        <br>
                        <small class="text-muted">${order.items.map(item => item.name).join(', ')}</small>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-outline-primary view-order-details" 
                                data-order-id="${order.id}">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Configurar event listeners para los botones de ver detalles
    document.querySelectorAll('.view-order-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            showOrderDetails(orderId);
        });
    });
    
    pagination.classList.remove('d-none');
}

function showNoOrdersMessage() {
    const ordersContainer = document.getElementById('orders-container');
    ordersContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-receipt display-1 text-muted"></i>
            <h5 class="mt-3 text-muted">No tienes pedidos realizados</h5>
            <p class="text-muted">Cuando realices tu primer pedido, aparecerá aquí.</p>
            <a href="/src/pages/reposteria.html" class="btn btn-primary mt-2">
                <i class="bi bi-bag me-1"></i>Ver productos
            </a>
        </div>
    `;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginationElement = document.getElementById('orders-pagination');
    
    if (totalPages <= 1) {
        paginationElement.classList.add('d-none');
        return;
    }
    
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
        </li>
    `;
    
    paginationElement.querySelector('.pagination').innerHTML = paginationHTML;
    
    // Configurar event listeners para la paginación
    paginationElement.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) {
                currentPage = page;
                renderOrders();
                updatePagination();
                window.scrollTo(0, 0);
            }
        });
    });
    
    paginationElement.classList.remove('d-none');
}

function showOrderDetails(orderId) {
    const order = filteredOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('order-details-content');
    
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Información del Pedido</h6>
                <p><strong>N° de Pedido:</strong> ${order.id}</p>
                <p><strong>Fecha:</strong> ${formatDateTime(order.date)}</p>
                <p><strong>Estado:</strong> <span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span></p>
            </div>
            <div class="col-md-6">
                <h6>Información de Entrega</h6>
                <p><strong>Dirección:</strong> ${order.shippingAddress || 'No especificada'}</p>
                <p><strong>Método de envío:</strong> ${order.shippingMethod || 'Estándar'}</p>
            </div>
        </div>
        
        <hr>
        
        <h6 class="mt-3">Productos</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-end">Precio Unitario</th>
                        <th class="text-end">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-end">${formatCurrency(item.price)}</td>
                            <td class="text-end">${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    ${order.discounts > 0 ? `
                        <tr>
                            <td colspan="3" class="text-end"><strong>Descuentos:</strong></td>
                            <td class="text-end text-danger"><strong>-${formatCurrency(order.discounts)}</strong></td>
                        </tr>
                    ` : ''}
                    <tr>
                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                        <td class="text-end"><strong>${formatCurrency(order.total)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        ${order.status === 'pending' ? `
            <div class="alert alert-warning mt-3">
                <i class="bi bi-info-circle me-2"></i>
                Tu pedido está pendiente de confirmación. Te notificaremos cuando comience su preparación.
            </div>
        ` : ''}
        
        ${order.status === 'processing' ? `
            <div class="alert alert-info mt-3">
                <i class="bi bi-clock me-2"></i>
                Tu pedido está en preparación. Estamos trabajando para que lo recibas pronto.
            </div>
        ` : ''}
    `;
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'pending': return 'bg-warning';
        case 'processing': return 'bg-info';
        case 'shipped': return 'bg-primary';
        case 'delivered': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Pendiente';
        case 'processing': return 'En preparación';
        case 'shipped': return 'En camino';
        case 'delivered': return 'Entregado';
        case 'cancelled': return 'Cancelado';
        default: return status;
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Asegúrate de que createSampleOrders esté disponible globalmente
window.createSampleOrders = createSampleOrders;

// Función para forzar la regeneración de órdenes de muestra
window.regenerateSampleOrders = function() {
    const user = authManager.getCurrentUser();
    if (user) {
        localStorage.removeItem(`orders_${user.id}`);
        loadOrders();
        alert('Órdenes de muestra regeneradas con precios actualizados');
    }
};