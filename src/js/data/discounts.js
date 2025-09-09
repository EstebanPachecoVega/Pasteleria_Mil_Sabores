// Reglas de descuento para Pastelería Mil Sabores
export const discountRules = {
    // Descuento para mayores de 50 años (50% en todos los productos)
    ageDiscount: {
        type: 'percentage',
        value: 50,
        description: '50% de descuento para mayores de 50 años',
        validate: (userData) => {
            return userData && userData.age >= 50;
        },
        apply: (cartItems, userData) => {
            if (userData && userData.age >= 50) {
                return cartItems.map(item => ({
                    ...item,
                    originalPrice: item.price,
                    price: Math.round(item.price * 0.5),
                    discountApplied: 'age50'
                }));
            }
            return cartItems;
        }
    },

    // Descuento por código FELICES50 (10% permanente)
    codeFELICES50: {
        type: 'percentage',
        value: 10,
        description: '10% de descuento permanente con código FELICES50',
        validate: (userData, code) => {
            return code === 'FELICES50' || (userData && userData.discountCode === 'FELICES50');
        },
        apply: (cartItems, userData, code) => {
            const isValid = code === 'FELICES50' || (userData && userData.discountCode === 'FELICES50');
            if (isValid) {
                return cartItems.map(item => ({
                    ...item,
                    originalPrice: item.originalPrice || item.price,
                    price: Math.round(item.price * 0.9),
                    discountApplied: 'felices50'
                }));
            }
            return cartItems;
        }
    },

    // Tortas gratis para estudiantes Duoc en su cumpleaños
    studentDuocBirthday: {
        type: 'category',
        value: 100, // 100% de descuento
        description: 'Torta gratis en tu cumpleaños (estudiantes Duoc)',
        validate: (userData, currentDate = new Date()) => {
            if (!userData) return false;
            
            // Verificar correo institucional Duoc
            const isDuocStudent = userData.email && userData.email.endsWith('@duoc.cl');
            
            // Verificar si es cumpleaños
            const isBirthday = userData.birthdate && 
                              new Date(userData.birthdate).getDate() === currentDate.getDate() &&
                              new Date(userData.birthdate).getMonth() === currentDate.getMonth();
            
            return isDuocStudent && isBirthday;
        },
        apply: (cartItems, userData, currentDate = new Date()) => {
            const isValid = userData && 
                           userData.email && userData.email.endsWith('@duoc.cl') &&
                           userData.birthdate &&
                           new Date(userData.birthdate).getDate() === currentDate.getDate() &&
                           new Date(userData.birthdate).getMonth() === currentDate.getMonth();
            
            if (isValid) {
                return cartItems.map(item => {
                    // Aplicar solo a tortas (categorías que contienen "torta")
                    const isCake = item.category && (
                        item.category.includes('torta') || 
                        item.category.includes('Torta') ||
                        item.category.includes('Tortas')
                    );
                    
                    if (isCake) {
                        return {
                            ...item,
                            originalPrice: item.originalPrice || item.price,
                            price: 0, // Gratis
                            discountApplied: 'duocBirthday'
                        };
                    }
                    return item;
                });
            }
            return cartItems;
        }
    }
};

// Función para aplicar todos los descuentos elegibles
export function applyAllDiscounts(cartItems, userData, discountCode = null) {
    let discountedItems = [...cartItems];
    
    // Aplicar descuentos en orden de prioridad
    discountedItems = discountRules.ageDiscount.apply(discountedItems, userData);
    discountedItems = discountRules.codeFELICES50.apply(discountedItems, userData, discountCode);
    discountedItems = discountRules.studentDuocBirthday.apply(discountedItems, userData);
    
    return discountedItems;
}

// Función para validar un código de descuento
export function validateDiscountCode(code, userData) {
    if (code === 'FELICES50') {
        return {
            valid: true,
            description: discountRules.codeFELICES50.description
        };
    }
    
    // Podrías añadir más códigos aquí en el futuro
    
    return {
        valid: false,
        description: 'Código de descuento no válido'
    };
}