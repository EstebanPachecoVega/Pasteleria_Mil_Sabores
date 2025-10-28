import { db } from '../config/firebase';
import { collection, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const populateFirebaseData = async () => {
    try {
        console.log('🏗️ Iniciando población de datos en Firebase...');

        // Función para crear documento solo si no existe
        const createDocument = async (collectionName, id, data) => {
            const docRef = doc(db, collectionName, id.toString());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(`⏭️  Ya existe: ${collectionName}/${id} - ${data.name}`);
                return false;
            } else {
                await setDoc(docRef, {
                    ...data,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                console.log(`✅ Creado: ${collectionName}/${id} - ${data.name}`);
                return true;
            }
        };

        // 1. Poblar las 16 Regiones de Chile (Norte a Sur)
        const regiones = [
            { id: 15, name: 'Región de Arica y Parinacota', orden: 1 },
            { id: 1, name: 'Región de Tarapacá', orden: 2 },
            { id: 2, name: 'Región de Antofagasta', orden: 3 },
            { id: 3, name: 'Región de Atacama', orden: 4 },
            { id: 4, name: 'Región de Coquimbo', orden: 5 },
            { id: 5, name: 'Región de Valparaíso', orden: 6 },
            { id: 13, name: 'Región Metropolitana de Santiago', orden: 7 },
            { id: 6, name: 'Región del Libertador General Bernardo O\'Higgins', orden: 8 },
            { id: 7, name: 'Región del Maule', orden: 9 },
            { id: 16, name: 'Región de Ñuble', orden: 10 },
            { id: 8, name: 'Región del Biobío', orden: 11 },
            { id: 9, name: 'Región de La Araucanía', orden: 12 },
            { id: 14, name: 'Región de Los Ríos', orden: 13 },
            { id: 10, name: 'Región de Los Lagos', orden: 14 },
            { id: 11, name: 'Región de Aysén del General Carlos Ibáñez del Campo', orden: 15 },
            { id: 12, name: 'Región de Magallanes y de la Antártica Chilena', orden: 16 }
        ];

        let regionesCreadas = 0;
        for (const region of regiones) {
            const creada = await createDocument('region', region.id, region);
            if (creada) regionesCreadas++;
        }

        // 2. Poblar Comunas (Estrategia: Zona Central completa, principales en otras)
        const comunas = [
            // ========== REGIÓN DE ARICA Y PARINACOTA (15) ==========
            { id: 15101, name: 'Arica', regionId: 15, regionName: 'Región de Arica y Parinacota' },
            { id: 15102, name: 'Camarones', regionId: 15, regionName: 'Región de Arica y Parinacota' },
            { id: 15201, name: 'Putre', regionId: 15, regionName: 'Región de Arica y Parinacota' },
            { id: 15202, name: 'General Lagos', regionId: 15, regionName: 'Región de Arica y Parinacota' },

            // ========== REGIÓN DE TARAPACÁ (1) ==========
            { id: 1101, name: 'Iquique', regionId: 1, regionName: 'Región de Tarapacá' },
            { id: 1107, name: 'Alto Hospicio', regionId: 1, regionName: 'Región de Tarapacá' },
            { id: 1401, name: 'Pozo Almonte', regionId: 1, regionName: 'Región de Tarapacá' },
            { id: 1402, name: 'Camiña', regionId: 1, regionName: 'Región de Tarapacá' },

            // ========== REGIÓN DE ANTOFAGASTA (2) ==========
            { id: 2101, name: 'Antofagasta', regionId: 2, regionName: 'Región de Antofagasta' },
            { id: 2102, name: 'Mejillones', regionId: 2, regionName: 'Región de Antofagasta' },
            { id: 2103, name: 'Sierra Gorda', regionId: 2, regionName: 'Región de Antofagasta' },
            { id: 2104, name: 'Taltal', regionId: 2, regionName: 'Región de Antofagasta' },
            { id: 2201, name: 'Calama', regionId: 2, regionName: 'Región de Antofagasta' },
            { id: 2202, name: 'Ollagüe', regionId: 2, regionName: 'Región de Antofagasta' },
            { id: 2203, name: 'San Pedro de Atacama', regionId: 2, regionName: 'Región de Antofagasta' },

            // ========== REGIÓN DE ATACAMA (3) ==========
            { id: 3101, name: 'Copiapó', regionId: 3, regionName: 'Región de Atacama' },
            { id: 3102, name: 'Caldera', regionId: 3, regionName: 'Región de Atacama' },
            { id: 3103, name: 'Tierra Amarilla', regionId: 3, regionName: 'Región de Atacama' },
            { id: 3201, name: 'Chañaral', regionId: 3, regionName: 'Región de Atacama' },
            { id: 3202, name: 'Diego de Almagro', regionId: 3, regionName: 'Región de Atacama' },

            // ========== REGIÓN DE COQUIMBO (4) ==========
            { id: 4101, name: 'La Serena', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4102, name: 'Coquimbo', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4103, name: 'Andacollo', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4104, name: 'La Higuera', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4105, name: 'Paihuano', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4106, name: 'Vicuña', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4201, name: 'Illapel', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4202, name: 'Canela', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4203, name: 'Los Vilos', regionId: 4, regionName: 'Región de Coquimbo' },
            { id: 4204, name: 'Salamanca', regionId: 4, regionName: 'Región de Coquimbo' },

            // ========== REGIÓN DE VALPARAÍSO (5) - TODAS LAS COMUNAS ==========
            { id: 5101, name: 'Valparaíso', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5102, name: 'Casablanca', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5103, name: 'Concón', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5104, name: 'Juan Fernández', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5105, name: 'Puchuncaví', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5107, name: 'Quintero', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5109, name: 'Viña del Mar', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5501, name: 'Isla de Pascua', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5201, name: 'Los Andes', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5202, name: 'Calle Larga', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5203, name: 'Rinconada', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5204, name: 'San Esteban', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5301, name: 'La Ligua', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5302, name: 'Cabildo', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5303, name: 'Papudo', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5304, name: 'Petorca', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5305, name: 'Zapallar', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5401, name: 'Quillota', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5402, name: 'La Calera', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5403, name: 'Hijuelas', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5404, name: 'La Cruz', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5405, name: 'Nogales', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5601, name: 'San Antonio', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5602, name: 'Algarrobo', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5603, name: 'Cartagena', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5604, name: 'El Quisco', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5605, name: 'El Tabo', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5606, name: 'Santo Domingo', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5701, name: 'San Felipe', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5702, name: 'Catemu', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5703, name: 'Llaillay', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5704, name: 'Panquehue', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5705, name: 'Putaendo', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5706, name: 'Santa María', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5801, name: 'Quilpué', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5802, name: 'Limache', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5803, name: 'Olmué', regionId: 5, regionName: 'Región de Valparaíso' },
            { id: 5804, name: 'Villa Alemana', regionId: 5, regionName: 'Región de Valparaíso' },

            // ========== REGIÓN METROPOLITANA (13) - TODAS LAS COMUNAS ==========
            { id: 13101, name: 'Santiago', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13102, name: 'Cerrillos', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13103, name: 'Cerro Navia', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13104, name: 'Conchalí', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13105, name: 'El Bosque', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13106, name: 'Estación Central', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13107, name: 'Huechuraba', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13108, name: 'Independencia', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13109, name: 'La Cisterna', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13110, name: 'La Florida', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13111, name: 'La Granja', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13112, name: 'La Pintana', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13113, name: 'La Reina', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13114, name: 'Las Condes', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13115, name: 'Lo Barnechea', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13116, name: 'Lo Espejo', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13117, name: 'Lo Prado', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13118, name: 'Macul', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13119, name: 'Maipú', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13120, name: 'Ñuñoa', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13121, name: 'Pedro Aguirre Cerda', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13122, name: 'Peñalolén', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13123, name: 'Providencia', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13124, name: 'Pudahuel', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13125, name: 'Quilicura', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13126, name: 'Quinta Normal', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13127, name: 'Recoleta', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13128, name: 'Renca', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13129, name: 'San Joaquín', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13130, name: 'San Miguel', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13131, name: 'San Ramón', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13132, name: 'Vitacura', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13201, name: 'Puente Alto', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13202, name: 'Pirque', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13203, name: 'San José de Maipo', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13301, name: 'Colina', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13302, name: 'Lampa', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13303, name: 'Tiltil', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13401, name: 'San Bernardo', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13402, name: 'Buin', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13403, name: 'Calera de Tango', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13404, name: 'Paine', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13501, name: 'Melipilla', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13502, name: 'Alhué', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13503, name: 'Curacaví', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13504, name: 'María Pinto', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13505, name: 'San Pedro', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13601, name: 'Talagante', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13602, name: 'El Monte', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13603, name: 'Isla de Maipo', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13604, name: 'Padre Hurtado', regionId: 13, regionName: 'Región Metropolitana de Santiago' },
            { id: 13605, name: 'Peñaflor', regionId: 13, regionName: 'Región Metropolitana de Santiago' },

            // ========== REGIÓN DE O'HIGGINS (6) - TODAS LAS COMUNAS ==========
            { id: 6101, name: 'Rancagua', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6102, name: 'Codegua', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6103, name: 'Coinco', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6104, name: 'Coltauco', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6105, name: 'Doñihue', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6106, name: 'Graneros', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6107, name: 'Las Cabras', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6108, name: 'Machalí', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6109, name: 'Malloa', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6110, name: 'Mostazal', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6111, name: 'Olivar', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6112, name: 'Peumo', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6113, name: 'Pichidegua', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6114, name: 'Quinta de Tilcoco', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6115, name: 'Rengo', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6116, name: 'Requínoa', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6117, name: 'San Vicente de Tagua Tagua', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6201, name: 'Pichilemu', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6202, name: 'La Estrella', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6203, name: 'Litueche', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6204, name: 'Marchihue', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6205, name: 'Navidad', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6206, name: 'Paredones', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6301, name: 'San Fernando', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6302, name: 'Chépica', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6303, name: 'Chimbarongo', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6304, name: 'Lolol', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6305, name: 'Nancagua', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6306, name: 'Palmilla', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6307, name: 'Peralillo', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6308, name: 'Placilla', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6309, name: 'Pumanque', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },
            { id: 6310, name: 'Santa Cruz', regionId: 6, regionName: 'Región del Libertador General Bernardo O\'Higgins' },

            // ========== REGIÓN DEL MAULE (7) - TODAS LAS COMUNAS ==========
            { id: 7101, name: 'Talca', regionId: 7, regionName: 'Región del Maule' },
            { id: 7102, name: 'Constitución', regionId: 7, regionName: 'Región del Maule' },
            { id: 7103, name: 'Curepto', regionId: 7, regionName: 'Región del Maule' },
            { id: 7104, name: 'Empedrado', regionId: 7, regionName: 'Región del Maule' },
            { id: 7105, name: 'Maule', regionId: 7, regionName: 'Región del Maule' },
            { id: 7106, name: 'Pelarco', regionId: 7, regionName: 'Región del Maule' },
            { id: 7107, name: 'Pencahue', regionId: 7, regionName: 'Región del Maule' },
            { id: 7108, name: 'Río Claro', regionId: 7, regionName: 'Región del Maule' },
            { id: 7109, name: 'San Clemente', regionId: 7, regionName: 'Región del Maule' },
            { id: 7110, name: 'San Rafael', regionId: 7, regionName: 'Región del Maule' },
            { id: 7201, name: 'Cauquenes', regionId: 7, regionName: 'Región del Maule' },
            { id: 7202, name: 'Chanco', regionId: 7, regionName: 'Región del Maule' },
            { id: 7203, name: 'Pelluhue', regionId: 7, regionName: 'Región del Maule' },
            { id: 7301, name: 'Curicó', regionId: 7, regionName: 'Región del Maule' },
            { id: 7302, name: 'Hualañé', regionId: 7, regionName: 'Región del Maule' },
            { id: 7303, name: 'Licantén', regionId: 7, regionName: 'Región del Maule' },
            { id: 7304, name: 'Molina', regionId: 7, regionName: 'Región del Maule' },
            { id: 7305, name: 'Rauco', regionId: 7, regionName: 'Región del Maule' },
            { id: 7306, name: 'Romeral', regionId: 7, regionName: 'Región del Maule' },
            { id: 7307, name: 'Sagrada Familia', regionId: 7, regionName: 'Región del Maule' },
            { id: 7308, name: 'Teno', regionId: 7, regionName: 'Región del Maule' },
            { id: 7309, name: 'Vichuquén', regionId: 7, regionName: 'Región del Maule' },
            { id: 7401, name: 'Linares', regionId: 7, regionName: 'Región del Maule' },
            { id: 7402, name: 'Colbún', regionId: 7, regionName: 'Región del Maule' },
            { id: 7403, name: 'Longaví', regionId: 7, regionName: 'Región del Maule' },
            { id: 7404, name: 'Parral', regionId: 7, regionName: 'Región del Maule' },
            { id: 7405, name: 'Retiro', regionId: 7, regionName: 'Región del Maule' },
            { id: 7406, name: 'San Javier', regionId: 7, regionName: 'Región del Maule' },
            { id: 7407, name: 'Villa Alegre', regionId: 7, regionName: 'Región del Maule' },
            { id: 7408, name: 'Yerbas Buenas', regionId: 7, regionName: 'Región del Maule' },

            // ========== REGIÓN DE ÑUBLE (16) - PRINCIPALES COMUNAS ==========
            { id: 16101, name: 'Chillán', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16102, name: 'Chillán Viejo', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16201, name: 'Bulnes', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16202, name: 'Chillán', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16203, name: 'Diguillín', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16204, name: 'Punilla', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16205, name: 'San Carlos', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16206, name: 'San Fabián', regionId: 16, regionName: 'Región de Ñuble' },
            { id: 16207, name: 'San Nicolás', regionId: 16, regionName: 'Región de Ñuble' },

            // ========== REGIÓN DEL BIOBÍO (8) - PRINCIPALES COMUNAS ==========
            { id: 8101, name: 'Concepción', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8102, name: 'Coronel', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8103, name: 'Chiguayante', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8104, name: 'Florida', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8105, name: 'Hualpén', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8106, name: 'Hualqui', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8107, name: 'Lota', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8108, name: 'Penco', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8109, name: 'San Pedro de la Paz', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8110, name: 'Santa Juana', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8111, name: 'Talcahuano', regionId: 8, regionName: 'Región del Biobío' },
            { id: 8112, name: 'Tomé', regionId: 8, regionName: 'Región del Biobío' },

            // ========== REGIÓN DE LA ARAUCANÍA (9) - PRINCIPALES COMUNAS ==========
            { id: 9101, name: 'Temuco', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9102, name: 'Carahue', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9103, name: 'Cunco', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9104, name: 'Curarrehue', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9105, name: 'Freire', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9106, name: 'Galvarino', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9107, name: 'Gorbea', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9108, name: 'Lautaro', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9109, name: 'Loncoche', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9110, name: 'Melipeuco', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9111, name: 'Nueva Imperial', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9112, name: 'Padre Las Casas', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9113, name: 'Perquenco', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9114, name: 'Pitrufquén', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9115, name: 'Pucón', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9116, name: 'Saavedra', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9117, name: 'Teodoro Schmidt', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9118, name: 'Toltén', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9119, name: 'Vilcún', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9120, name: 'Villarrica', regionId: 9, regionName: 'Región de La Araucanía' },
            { id: 9121, name: 'Cholchol', regionId: 9, regionName: 'Región de La Araucanía' },

            // ========== REGIÓN DE LOS RÍOS (14) - PRINCIPALES COMUNAS ==========
            { id: 14101, name: 'Valdivia', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14102, name: 'Corral', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14103, name: 'Lanco', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14104, name: 'Los Lagos', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14105, name: 'Máfil', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14106, name: 'Mariquina', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14107, name: 'Paillaco', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14108, name: 'Panguipulli', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14201, name: 'La Unión', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14202, name: 'Futrono', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14203, name: 'Lago Ranco', regionId: 14, regionName: 'Región de Los Ríos' },
            { id: 14204, name: 'Río Bueno', regionId: 14, regionName: 'Región de Los Ríos' },

            // ========== REGIÓN DE LOS LAGOS (10) - PRINCIPALES COMUNAS ==========
            { id: 10101, name: 'Puerto Montt', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10102, name: 'Calbuco', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10103, name: 'Cochamó', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10104, name: 'Fresia', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10105, name: 'Frutillar', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10106, name: 'Los Muermos', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10107, name: 'Llanquihue', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10108, name: 'Maullín', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10109, name: 'Puerto Varas', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10201, name: 'Castro', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10202, name: 'Ancud', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10203, name: 'Chonchi', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10204, name: 'Curaco de Vélez', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10205, name: 'Dalcahue', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10206, name: 'Puqueldón', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10207, name: 'Queilén', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10208, name: 'Quellón', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10209, name: 'Quemchi', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10210, name: 'Quinchao', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10301, name: 'Osorno', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10302, name: 'Puerto Octay', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10303, name: 'Purranque', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10304, name: 'Puyehue', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10305, name: 'Río Negro', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10306, name: 'San Juan de la Costa', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10307, name: 'San Pablo', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10401, name: 'Chaitén', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10402, name: 'Futaleufú', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10403, name: 'Hualaihué', regionId: 10, regionName: 'Región de Los Lagos' },
            { id: 10404, name: 'Palena', regionId: 10, regionName: 'Región de Los Lagos' },

            // ========== REGIÓN DE AYSÉN (11) - PRINCIPALES COMUNAS ==========
            { id: 11101, name: 'Coyhaique', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11102, name: 'Lago Verde', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11201, name: 'Aysén', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11202, name: 'Cisnes', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11203, name: 'Guaitecas', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11301, name: 'Cochrane', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11302, name: 'O\'Higgins', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11303, name: 'Tortel', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11401, name: 'Chile Chico', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },
            { id: 11402, name: 'Río Ibáñez', regionId: 11, regionName: 'Región de Aysén del General Carlos Ibáñez del Campo' },

            // ========== REGIÓN DE MAGALLANES (12) - PRINCIPALES COMUNAS ==========
            { id: 12101, name: 'Punta Arenas', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12102, name: 'Laguna Blanca', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12103, name: 'Río Verde', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12104, name: 'San Gregorio', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12201, name: 'Cabo de Hornos', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12202, name: 'Antártica', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12301, name: 'Porvenir', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12302, name: 'Primavera', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12303, name: 'Timaukel', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12401, name: 'Natales', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' },
            { id: 12402, name: 'Torres del Paine', regionId: 12, regionName: 'Región de Magallanes y de la Antártica Chilena' }
        ];

        let comunasCreadas = 0;
        for (const comuna of comunas) {
            const creada = await createDocument('comuna', comuna.id, comuna);
            if (creada) comunasCreadas++;
        }

        // 3. Poblar Tipos de Vivienda
        const tiposVivienda = [
            { id: 1, name: 'Casa' },
            { id: 2, name: 'Departamento' },
            { id: 3, name: 'Oficina' },
            { id: 4, name: 'Local Comercial' },
            { id: 5, name: 'Otro' }
        ];

        let tiposCreados = 0;
        for (const tipo of tiposVivienda) {
            const creado = await createDocument('tipo_vivienda', tipo.id, tipo);
            if (creado) tiposCreados++;
        }

        console.log('\n🎉 ¡Proceso completado!');
        console.log('📊 Resumen:');
        console.log(`   - Regiones: ${regionesCreadas} nuevas de ${regiones.length} totales`);
        console.log(`   - Comunas: ${comunasCreadas} nuevas de ${comunas.length} totales`);
        console.log(`   - Tipos de vivienda: ${tiposCreados} nuevos de ${tiposVivienda.length} totales`);
        console.log('\n💡 El script es seguro de ejecutar múltiples veces - solo crea documentos que no existan.');

    } catch (error) {
        console.error('❌ Error al poblar datos:', error);
    }
};

export default populateFirebaseData;