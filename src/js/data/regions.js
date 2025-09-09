// Regiones y comunas de Chile
export const regions = [
    {
        id: 1,
        name: "Región de Tarapacá",
        communes: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"]
    },
    {
        id: 2,
        name: "Región de Antofagasta",
        communes: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"]
    },
    {
        id: 3,
        name: "Región de Atacama",
        communes: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"]
    },
    // ... se pueden agregar más regiones según sea necesario
    {
        id: 13,
        name: "Región Metropolitana de Santiago",
        communes: [
            "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huachuraba", 
            "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", 
            "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", 
            "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", 
            "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", 
            "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", 
            "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
        ]
    }
];

export function getCommunesByRegion(regionId) {
    const region = regions.find(r => r.id === regionId);
    return region ? region.communes : [];
}

export function getAllRegions() {
    return regions;
}