import { getProductById } from '../data/products.js';
import { DiscountManager } from './DiscountManager.js';

export class CartManager {
    constructor() {
        this.cart = [];
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // Delegamos eventos solo dentro del contenedor del carrito (más seguro)
        const cartItemsContainer = document.getElementById('cart-items-container');

        // Si aún no existe en el DOM, colocamos un listener global para cuando aparezca (optional)
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const decreaseBtn = e.target.closest('.cart-item-decrease');
                const increaseBtn = e.target.closest('.cart-item-increase');
                const removeBtn = e.target.closest('.cart-item-remove');

                if (decreaseBtn) {
                    const productId = decreaseBtn.closest('.cart-item')?.dataset.productId;
                    if (productId) this.updateQuantity(productId, -1);
                    return;
                }

                if (increaseBtn) {
                    const productId = increaseBtn.closest('.cart-item')?.dataset.productId;
                    if (productId) this.updateQuantity(productId, 1);
                    return;
                }

                if (removeBtn) {
                    const productId = removeBtn.closest('.cart-item')?.dataset.productId;
                    if (productId) this.removeFromCart(productId);
                    return;
                }
            });
        } else {
            // Fallback: delegación global (no ideal, pero evita romper si el offcanvas se carga dinámicamente)
            document.addEventListener('click', (e) => {
                const decreaseBtn = e.target.closest('.cart-item-decrease');
                const increaseBtn = e.target.closest('.cart-item-increase');
                const removeBtn = e.target.closest('.cart-item-remove');

                if (decreaseBtn || increaseBtn || removeBtn) {
                    const btn = decreaseBtn || increaseBtn || removeBtn;
                    const productId = btn.closest('.cart-item')?.dataset.productId;
                    if (!productId) return;
                    if (decreaseBtn) this.updateQuantity(productId, -1);
                    if (increaseBtn) this.updateQuantity(productId, 1);
                    if (removeBtn) this.removeFromCart(productId);
                }
            });
        }

        // Guardar carrito cuando se cierre el offcanvas (Bootstrap)
        document.getElementById('cartOffcanvas')?.addEventListener('hidden.bs.offcanvas', () => {
            this.saveCartToStorage();
        });
    }

    loadCartFromStorage() {
        try {
            const saved = localStorage.getItem('cart');
            this.cart = saved ? JSON.parse(saved) : [];
        } catch (err) {
            console.error('Error leyendo cart desde localStorage:', err);
            this.cart = [];
        }
    }

    saveCartToStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (err) {
            console.error('Error guardando cart en localStorage:', err);
        }
    }

    /**
     * addToCart acepta:
     * - string id, o
     * - objeto producto { id, name, price, image, quantity? }
     */
    addToCart(productOrId) {
        let productData = null;

        if (typeof productOrId === 'object' && productOrId !== null) {
            productData = {
                id: String(productOrId.id),
                name: productOrId.name || 'Producto',
                price: this.normalizePrice(productOrId.price),
                image: productOrId.image || ''
            };
        } else {
            const id = String(productOrId);
            const p = getProductById(id);
            if (!p) {
                console.warn(`Producto con id ${id} no encontrado`);
                return;
            }
            productData = {
                id: String(p.id),
                name: p.name,
                price: this.normalizePrice(p.price),
                image: p.image || ''
            };
        }

        const existing = this.cart.find(i => i.id === productData.id);
        if (existing) {
            existing.quantity = (existing.quantity || 0) + 1;
        } else {
            this.cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                quantity: 1
            });
        }

        this.updateCartUI();
        this.showAddedToCartFeedback(productData);
    }

    normalizePrice(price) {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            const numeric = price.replace(/\$\s?|\./g, '').replace(/,/g, '');
            const parsed = parseInt(numeric, 10);
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;
        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCartUI();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
    }

    updateCartUI() {
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotals();
        this.saveCartToStorage();
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: this.cart } }));
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, it) => sum + (it.quantity || 0), 0);
        const el = document.getElementById('cart-count');
        if (!el) return;
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'block' : 'none';
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartEmptyState = document.getElementById('cart-empty-state');

        // Buscar summary por id o por clase (más tolerante)
        let cartSummary = document.getElementById('cart-summary');
        if (!cartSummary) cartSummary = document.querySelector('.cart-summary');

        if (!cartItemsContainer || !cartEmptyState) {
            // No podemos renderizar si faltan estos elementos
            console.warn('Cart UI elements missing (cart-items-container or cart-empty-state)');
            return;
        }

        if (this.cart.length === 0) {
            cartEmptyState.classList.remove('d-none');
            cartItemsContainer.classList.add('d-none');
            if (cartSummary) cartSummary.classList.add('d-none');
            return;
        }

        // Mostrar items
        cartEmptyState.classList.add('d-none');
        cartItemsContainer.classList.remove('d-none');
        if (cartSummary) cartSummary.classList.remove('d-none');

        const cartItemsList = cartItemsContainer.querySelector('.cart-items-list');
        if (!cartItemsList) {
            console.warn('Elemento .cart-items-list no encontrado dentro de #cart-items-container');
            return;
        }

        cartItemsList.innerHTML = this.cart.map(item => `
            <div class="cart-item d-flex border-bottom py-3" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" width="60" height="60" style="object-fit: cover;">
                <div class="cart-item-details ms-3 flex-grow-1">
                    <h6 class="cart-item-title mb-1">${item.name}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="quantity-selector d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary cart-item-decrease">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary cart-item-increase">+</button>
                        </div>
                        <span class="cart-item-price">${this.formatPrice(item.price * item.quantity)}</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-danger cart-item-remove">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `).join('');
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');
        const shippingEl = document.getElementById('cart-shipping');

        if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
        if (shippingEl) shippingEl.textContent = this.formatPrice(0); // por ahora 0
        if (totalEl) totalEl.textContent = this.formatPrice(subtotal + 0);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    }

    showAddedToCartFeedback(product) {
        console.log('Agregado al carrito:', product?.name ?? product);
        // aquí podrías disparar un toast o animación
    }

    

}
