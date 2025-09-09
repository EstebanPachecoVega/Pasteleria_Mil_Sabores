import { applyAllDiscounts, validateDiscountCode } from '../data/discounts.js';

export class DiscountManager {
    constructor() {
        this.appliedDiscounts = [];
        this.userData = this.loadUserData();
    }

    loadUserData() {
        // Cargar datos del usuario desde localStorage o donde los tengas almacenados
        return JSON.parse(localStorage.getItem('userData')) || null;
    }

    saveUserData(userData) {
        this.userData = userData;
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    applyDiscounts(cartItems, discountCode = null) {
        return applyAllDiscounts(cartItems, this.userData, discountCode);
    }

    validateDiscount(code) {
        return validateDiscountCode(code, this.userData);
    }

    getActiveDiscounts() {
        const activeDiscounts = [];
        
        if (this.userData && this.userData.age >= 50) {
            activeDiscounts.push({
                type: 'age',
                description: '50% de descuento para mayores de 50 años'
            });
        }
        
        if (this.userData && this.userData.discountCode === 'FELICES50') {
            activeDiscounts.push({
                type: 'code',
                description: '10% de descuento permanente con código FELICES50'
            });
        }
        
        if (this.userData && this.userData.email && this.userData.email.endsWith('@duoc.cl')) {
            const today = new Date();
            const birthdate = new Date(this.userData.birthdate);
            
            if (birthdate.getDate() === today.getDate() && 
                birthdate.getMonth() === today.getMonth()) {
                activeDiscounts.push({
                    type: 'birthday',
                    description: 'Torta gratis en tu cumpleaños (estudiantes Duoc)'
                });
            }
        }
        
        return activeDiscounts;
    }
}