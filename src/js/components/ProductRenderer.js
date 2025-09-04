// Componente para renderizar productos usando una plantilla HTML
export class ProductRenderer {
    constructor() {
        this.template = null;
    }

    async loadTemplate() {
        if (this.template) return this.template;
        
        const response = await fetch('/src/partials/product-card.html');
        this.template = await response.text();
        return this.template;
    }

    renderProduct(product) {
        let html = this.template;
        
        // Reemplazar placeholders con datos reales
        html = html.replace(/{{id}}/g, product.id)
                   .replace(/{{image}}/g, product.image)
                   .replace(/{{name}}/g, product.name)
                   .replace(/{{description}}/g, product.description)
                   .replace(/{{price}}/g, product.price);
        
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
        // Evento para agregar al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('.add-to-cart').dataset.productId;
                this.addToCart(productId);
            });
        });

        // Evento para ver detalles
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('.view-details').dataset.productId;
                this.viewDetails(productId);
            });
        });
    }

    addToCart(productId) {
        console.log(`Producto ${productId} agregado al carrito`);
        // Aquí implementarías la lógica del carrito
        // Por ahora, mostraremos una alerta
        alert(`Producto ${productId} agregado al carrito`);
    }

    viewDetails(productId) {
        console.log(`Viendo detalles del producto ${productId}`);
        // Aquí implementarías la navegación a detalles
        alert(`Viendo detalles del producto ${productId}`);
    }
}