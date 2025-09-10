import { AuthManager } from './AuthManager.js';

export class DiscountManager {
    constructor() {
        this.authManager = new AuthManager();
    }

    applyDiscounts(cartItems) {
        const user = this.authManager.getCurrentUser();
        if (!user) return cartItems; // No aplicar descuentos si no hay usuario logueado

        const discounts = this.authManager.getDiscountEligibility();
        let discountedItems = [...cartItems];

        // Aplicar descuento por edad (50% para mayores de 50 años)
        if (discounts.isOver50) {
            discountedItems = discountedItems.map(item => ({
                ...item,
                originalPrice: item.originalPrice || item.price,
                price: Math.round(item.price * 0.5),
                discountApplied: 'age50'
            }));
        }

        // Aplicar descuento permanente (10% con código FELICES50)
        if (discounts.hasPermanentDiscount) {
            discountedItems = discountedItems.map(item => ({
                ...item,
                originalPrice: item.originalPrice || item.price,
                price: Math.round(item.price * 0.9),
                discountApplied: item.discountApplied ? 
                               `${item.discountApplied}+felices50` : 'felices50'
            }));
        }

        // Tortas gratis para estudiantes Duoc en su cumpleaños
        if (discounts.isDuocStudent && discounts.isBirthday) {
            discountedItems = discountedItems.map(item => {
                const isCake = item.category && (
                    item.category.includes('torta') || 
                    item.category.includes('Torta') ||
                    item.category.includes('Tortas')
                );
                
                if (isCake) {
                    return {
                        ...item,
                        originalPrice: item.originalPrice || item.price,
                        price: 0,
                        discountApplied: item.discountApplied ? 
                                       `${item.discountApplied}+duocBirthday` : 'duocBirthday'
                    };
                }
                return item;
            });
        }

        return discountedItems;
    }

    getActiveDiscounts() {
        const discounts = this.authManager.getDiscountEligibility();
        const activeDiscounts = [];
        
        if (discounts.isOver50) {
            activeDiscounts.push({
                type: 'age',
                description: '50% de descuento para mayores de 50 años'
            });
        }
        
        if (discounts.hasPermanentDiscount) {
            activeDiscounts.push({
                type: 'code',
                description: '10% de descuento permanente con código FELICES50'
            });
        }
        
        if (discounts.isDuocStudent && discounts.isBirthday) {
            activeDiscounts.push({
                type: 'birthday',
                description: 'Torta gratis en tu cumpleaños (estudiantes Duoc)'
            });
        }
        
        return activeDiscounts;
    }
}