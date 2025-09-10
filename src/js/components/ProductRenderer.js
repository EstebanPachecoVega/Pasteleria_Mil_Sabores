
// Componente para renderizar productos usando una plantilla HTML
export class ProductRenderer {
    constructor() {
        this.template = null;
        this.cartManager = null; // Referencia al gestor del carrito
    }

    // Método para inyectar el CartManager
    setCartManager(cartManager) {
        this.cartManager = cartManager;
    }

    async loadTemplate() {
        if (this.template) return this.template;
        
        const response = await fetch('/src/partials/product-card.html');
        this.template = await response.text();
        return this.template;
    }

    renderProduct(product) {
        let html = this.template;
        
        // Calcular el precio numérico para los data attributes
        const numericPrice = this.parsePrice(product.price);
        
        // Reemplazar placeholders con datos reales
        html = html.replace(/{{id}}/g, product.id)
                   .replace(/{{image}}/g, product.image)
                   .replace(/{{name}}/g, product.name)
                   .replace(/{{description}}/g, product.description)
                   .replace(/{{price}}/g, product.price)
                   .replace(/{{numericPrice}}/g, numericPrice);
        
        return html;
    }

    renderProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = ''; // Limpiar contenedor
        
        products.forEach(product => {
            const productHtml = this.renderProduct(product);
            container.innerHTML += productHtml;
        });
        
        // Añadir event listeners después de renderizar
        this.addEventListeners();
    }

    addEventListeners() {
    // Delegación de eventos para botones de "Agregar al Carrito" y "Ver Detalles"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const productId = btn.dataset.productId;
        const productName = btn.dataset.productName;
        const productPrice = btn.dataset.productPrice;
        const productImage = btn.dataset.productImage;
        
        if (this.cartManager) {
            this.cartManager.addToCart({
            id: productId,
            name: productName,
            price: parseInt(productPrice, 10) || 0,
            image: productImage,
            quantity: 1
            });
        } else {
            console.warn('CartManager no está inicializado');
            this.addToCart(productId);
        }
        });
    });

    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        this.viewDetails(productId);
        });
    });
    }


    addToCart(productId) {
        console.log(`Producto ${productId} agregado al carrito`);
        // Por ahora, mostraremos una alerta
        alert(`Producto ${productId} agregado al carrito`);
    }

    // Método para parsear precios
    parsePrice(priceString) {
        // Convierte "$45.000" a 45000
        return parseInt(priceString.replace(/\$\s?|\./g, ''));
    }

    viewDetails(productId) {
        console.log(`Viendo detalles del producto ${productId}`);
        // Aquí implementarías la navegación a detalles
        alert(`Viendo detalles del producto ${productId}`);
    }

    // Nueva función para buscar productos por nombre
    filterProductsByName(products, searchTerm) {
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
}