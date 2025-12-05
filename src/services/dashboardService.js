import { db } from "../config/firebase";
import {
    collection,
    getCountFromServer,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from "firebase/firestore";

export class DashboardService {
    static async obtenerTotalCompras() {
        try {
            const comprasRef = collection(db, "order");
            const snapshot = await getCountFromServer(comprasRef);
            return snapshot.data().count;
        } catch (error) {
            console.error("Error al obtener total de compras:", error);
            return 0;
        }
    }

    static async calcularProyeccionCompras() {
        try {
            const ahora = new Date();
            const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
            const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
            const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

            const comprasRef = collection(db, "order");

            const consultaActual = query(
                comprasRef,
                where("createdAt", ">=", Timestamp.fromDate(inicioMesActual)),
                where("createdAt", "<=", Timestamp.fromDate(ahora))
            );

            const consultaAnterior = query(
                comprasRef,
                where("createdAt", ">=", Timestamp.fromDate(inicioMesAnterior)),
                where("createdAt", "<=", Timestamp.fromDate(finMesAnterior))
            );

            const [snapshotActual, snapshotAnterior] = await Promise.all([
                getCountFromServer(consultaActual),
                getCountFromServer(consultaAnterior)
            ]);

            const comprasActual = snapshotActual.data().count;
            const comprasAnterior = snapshotAnterior.data().count;

            if (comprasAnterior === 0) {
                return comprasActual > 0 ? 100 : 0;
            }

            const aumento = ((comprasActual - comprasAnterior) / comprasAnterior) * 100;
            return Math.round(aumento);
        } catch (error) {
            console.error("Error al calcular proyección:", error);
            return 0;
        }
    }

    static async obtenerTotalProductos() {
        try {
            const productosRef = collection(db, "producto");
            const consulta = query(productosRef, where("activo", "==", true));
            const snapshot = await getCountFromServer(consulta);
            return snapshot.data().count;
        } catch (error) {
            console.error("Error al obtener total de productos:", error);
            return 0;
        }
    }

    static async calcularInventarioTotal() {
        try {
            const productosRef = collection(db, "producto");
            const consulta = query(productosRef, where("activo", "==", true));
            const snapshot = await getDocs(consulta);
            
            let totalInventario = 0;
            snapshot.forEach((doc) => {
                const producto = doc.data();
                totalInventario += producto.stock || 0;
            });

            return totalInventario;
        } catch (error) {
            console.error("Error al calcular inventario:", error);
            return 0;
        }
    }

    static async obtenerTotalUsuarios() {
        try {
            const usuariosRef = collection(db, "usuario");
            const snapshot = await getCountFromServer(usuariosRef);
            return snapshot.data().count;
        } catch (error) {
            console.error("Error al obtener total de usuarios:", error);
            return 0;
        }
    }

    static async calcularNuevosUsuariosMes() {
        try {
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            const usuariosRef = collection(db, "usuario");
            const consulta = query(
                usuariosRef,
                where("createdAt", ">=", Timestamp.fromDate(inicioMes))
            );

            const snapshot = await getCountFromServer(consulta);
            return snapshot.data().count;
        } catch (error) {
            console.error("Error al calcular nuevos usuarios:", error);
            return 0;
        }
    }

    static async calcularVentasTotales() {
        try {
            const comprasRef = collection(db, "order");
            const snapshot = await getDocs(comprasRef);
            
            let ventasTotales = 0;
            snapshot.forEach((doc) => {
                const compra = doc.data();
                ventasTotales += compra.total || compra.montoTotal || 0;
            });

            return ventasTotales;
        } catch (error) {
            console.error("Error al calcular ventas totales:", error);
            return 0;
        }
    }

    static async obtenerVentasUltimaSemana() {
        try {
            const unaSemanaAtras = new Date();
            unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

            const comprasRef = collection(db, "order");
            const consulta = query(
                comprasRef,
                where("createdAt", ">=", Timestamp.fromDate(unaSemanaAtras)),
                where("createdAt", "<=", Timestamp.fromDate(new Date()))
            );

            const snapshot = await getDocs(consulta);
            const ventasPorDia = {};

            snapshot.forEach((doc) => {
                const compra = doc.data();
                const fecha = compra.createdAt?.toDate?.() || new Date();
                const dia = fecha.toISOString().split('T')[0];

                if (!ventasPorDia[dia]) {
                    ventasPorDia[dia] = 0;
                }
                ventasPorDia[dia] += compra.total || compra.montoTotal || 0;
            });

            return ventasPorDia;
        } catch (error) {
            console.error("Error al obtener ventas de la semana:", error);
            return {};
        }
    }

    static async obtenerEstadisticasCompletas() {
        try {
            const [
                totalCompras,
                proyeccion,
                totalProductos,
                inventario,
                totalUsuarios,
                nuevosUsuarios,
                ventasTotales
            ] = await Promise.all([
                this.obtenerTotalCompras(),
                this.calcularProyeccionCompras(),
                this.obtenerTotalProductos(),
                this.calcularInventarioTotal(),
                this.obtenerTotalUsuarios(),
                this.calcularNuevosUsuariosMes(),
                this.calcularVentasTotales()
            ]);

            return {
                totalCompras,
                proyeccionCompras: proyeccion,
                totalProductos,
                inventarioTotal: inventario,
                totalUsuarios,
                nuevosUsuariosMes: nuevosUsuarios,
                ventasTotales: ventasTotales
            };

        } catch (error) {
            console.error("Error al obtener estadísticas completas:", error);
            return {
                totalCompras: 0,
                proyeccionCompras: 0,
                totalProductos: 0,
                inventarioTotal: 0,
                totalUsuarios: 0,
                nuevosUsuariosMes: 0,
                ventasTotales: 0
            };
        }
    }
}