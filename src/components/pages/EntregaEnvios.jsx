import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

const EntregaEnvios = () => {
    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">Política de Entrega y Envíos</h1>

            <Row className="justify-content-center">
                <Col lg={10}>

                    {/* SECCIÓN INFORMATIVA */}
                    <div className="mb-5">
                        <h2 className="mb-4">Información de Envíos</h2>

                        <Alert variant="info" className="mb-4">
                            <strong>¡Envío gratis!</strong> En compras sobre $50.000 en Región Metropolitana
                        </Alert>

                        <Row>
                            <Col md={6}>
                                <div className="mb-4">
                                    <h5 className="text-chocolate">🏙️ Región Metropolitana</h5>
                                    <ul className="list-unstyled">
                                        <li>• <strong>Costo:</strong> $3.000 (Gratis sobre $50.000)</li>
                                        <li>• <strong>Tiempo:</strong> Mismo día (pedidos antes de 12:00)</li>
                                        <li>• <strong>Horario:</strong> 9:00 - 20:00 hrs</li>
                                        <li>• <strong>Zonas:</strong> Todas las comunas</li>
                                    </ul>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-4">
                                    <h5 className="text-chocolate">🗺️ Regiones</h5>
                                    <ul className="list-unstyled">
                                        <li>• <strong>Región V:</strong> $5.000 - $8.000</li>
                                        <li>• <strong>Otras regiones:</strong> $8.000 - $15.000</li>
                                        <li>• <strong>Tiempo:</strong> 2-3 días hábiles</li>
                                        <li>• <strong>Consultar:</strong> Zonas extremas</li>
                                    </ul>
                                </div>
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <h5 className="text-chocolate">📅 Entregas Especiales</h5>
                            <ul>
                                <li><strong>Fines de semana:</strong> Disponible con cargo adicional de $2.000</li>
                                <li><strong>Horario extendido:</strong> 20:00 - 22:00 hrs (+$1.500)</li>
                                <li><strong>Pedidos express:</strong> 2 horas (+50% del valor envío)</li>
                            </ul>
                        </div>
                    </div>

                    {/* SECCIÓN POLÍTICAS */}
                    <div className="mb-5">
                        <h2 className="mb-4">Políticas de Entrega</h2>

                        <Row>
                            <Col md={6}>
                                <div className="mb-4">
                                    <h5 className="text-chocolate">⏰ Gestión de Retrasos</h5>
                                    <ul>
                                        <li><strong>Retraso 1-2 horas:</strong> Notificación inmediata</li>
                                        <li><strong>Retraso +2 horas:</strong> Reembolso 100% costo envío</li>
                                        <li><strong>Retraso +4 horas:</strong> 10% descuento en próxima compra</li>
                                        <li><strong>Cancelación nuestra:</strong> Reembolso total + voucher $5.000</li>
                                    </ul>
                                </div>

                                <div className="mb-4">
                                    <h5 className="text-chocolate">📦 Condiciones de Recepción</h5>
                                    <ul>
                                        <li><strong>Verificación obligatoria:</strong> Revisar producto al recibir</li>
                                        <li><strong>Daños visibles:</strong> Rechazar y contactarnos inmediatamente</li>
                                        <li><strong>Temperatura:</strong> Productos refrigerados deben recibirse fríos</li>
                                        <li><strong>Embalaje:</strong> Verificar integridad del packaging</li>
                                    </ul>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-4">
                                    <h5 className="text-chocolate">👤 Responsabilidades</h5>
                                    <ul>
                                        <li><strong>Nuestra responsabilidad:</strong>
                                            <ul>
                                                <li>Daños durante transporte</li>
                                                <li>Incumplimiento de horarios</li>
                                                <li>Productos incorrectos</li>
                                            </ul>
                                        </li>
                                        <li><strong>Responsabilidad del cliente:</strong>
                                            <ul>
                                                <li>Almacenamiento post-entrega</li>
                                                <li>Consumo dentro de plazos</li>
                                                <li>Informar dirección correcta</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mb-4">
                                    <h5 className="text-chocolate">🔄 Ausencia del Receptor</h5>
                                    <ul>
                                        <li><strong>1ra visita:</strong> Llamado de coordinación</li>
                                        <li><strong>2da visita:</strong> Reprogramación con costo $1.500</li>
                                        <li><strong>3ra visita:</strong> Producto regresa a bodega</li>
                                        <li><strong>Productos perecederos:</strong> No se guardan más de 24h</li>
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* SECCIÓN PRODUCTOS PERECEDEROS */}
                    <Alert variant="warning">
                        <h5 className="alert-heading">⚠️ Importante: Productos Perecederos</h5>
                        <p className="mb-0">
                            Por la naturaleza de nuestros productos, recomendamos:<br />
                            • <strong>Consumo inmediato</strong> post-entrega<br />
                            • <strong>Refrigeración</strong> si no se consume de inmediato<br />
                            • <strong>No dejar</strong> a temperatura ambiente por más de 2 horas<br />
                            • Vida útil: 3-5 días refrigerado (consultar por producto)
                        </p>
                    </Alert>

                    {/* CONTACTO */}
                    <div className="text-center mt-4">
                        <h5 className="text-chocolate">¿Necesitas ayuda con tu envío?</h5>
                        <p className="mb-1">
                            <strong>WhatsApp:</strong> +56 9 1234 5678<br />
                            <strong>Email:</strong> envios@milsabores.cl<br />
                            <strong>Horario:</strong> Lunes a Sábado 9:00 - 21:00 hrs
                        </p>
                    </div>

                </Col>
            </Row>
        </Container>
    );
};

export default EntregaEnvios;