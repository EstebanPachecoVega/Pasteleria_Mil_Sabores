import React from 'react';
import { Container, Row, Col, Alert, Card } from 'react-bootstrap';

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
                            <strong>¡Envío gratis!</strong> En compras sobre $40.000 en Región Metropolitana y $45.000 en otras regiones
                        </Alert>

                        <Row>
                            <Col md={6}>
                                <Card className="h-100 border-success">
                                    <Card.Body>
                                        <h5 className="text-success">
                                            <i className="bi bi-buildings me-2"></i>
                                            Región Metropolitana
                                        </h5>
                                        <ul className="list-unstyled">
                                            <li>• <strong>Costo:</strong> $2.500 (Gratis sobre $40.000)</li>
                                            <li>• <strong>Tiempo:</strong> 24-48 horas</li>
                                            <li>• <strong>Horario:</strong> 9:00 - 20:00 hrs</li>
                                            <li>• <strong>Cobertura:</strong> Todas las comunas</li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="h-100 border-info">
                                    <Card.Body>
                                        <h5 className="text-info">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Zona Centro (V, VI, VII)
                                        </h5>
                                        <ul className="list-unstyled">
                                            <li>• <strong>Costo:</strong> $3.000 (Gratis sobre $45.000)</li>
                                            <li>• <strong>Tiempo:</strong> 2-3 días hábiles</li>
                                            <li>• <strong>Regiones:</strong> Valparaíso, O'Higgins, Maule</li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col md={6}>
                                <Card className="h-100 border-primary">
                                    <Card.Body>
                                        <h5 className="text-primary">
                                            <i className="bi bi-tree me-2"></i>
                                            Zona Sur (VIII, IX, X, XIV, XVI)
                                        </h5>
                                        <ul className="list-unstyled">
                                            <li>• <strong>Costo:</strong> $4.000 (Gratis sobre $45.000)</li>
                                            <li>• <strong>Tiempo:</strong> 3-4 días hábiles</li>
                                            <li>• <strong>Regiones:</strong> Biobío, Araucanía, Los Lagos</li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="h-100 border-warning">
                                    <Card.Body>
                                        <h5 className="text-warning">
                                            <i className="bi bi-sun me-2"></i>
                                            Zona Norte (XV, I, II, III, IV)
                                        </h5>
                                        <ul className="list-unstyled">
                                            <li>• <strong>Costo:</strong> $4.000 (Gratis sobre $45.000)</li>
                                            <li>• <strong>Tiempo:</strong> 4-5 días hábiles</li>
                                            <li>• <strong>Regiones:</strong> Arica a Coquimbo</li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <Card className="border-secondary">
                                <Card.Body>
                                    <h5 className="text-chocolate">
                                        <i className="bi bi-clock me-2"></i>
                                        Entregas Especiales
                                    </h5>
                                    <Row>
                                        <Col md={6}>
                                            <ul>
                                                <li><strong>Fines de semana:</strong> Disponible con cargo adicional de $2.000</li>
                                                <li><strong>Horario extendido:</strong> 20:00 - 22:00 hrs (+$1.500)</li>
                                            </ul>
                                        </Col>
                                        <Col md={6}>
                                            <ul>
                                                <li><strong>Pedidos express:</strong> Mismo día (+50% del valor envío)</li>
                                                <li><strong>Zonas extremas:</strong> Consultar disponibilidad y costos</li>
                                            </ul>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    {/* SECCIÓN POLÍTICAS */}
                    <div className="mb-5">
                        <h2 className="mb-4">Políticas de Entrega</h2>

                        <Row>
                            <Col md={6}>
                                <div className="mb-4">
                                    <h5 className="text-chocolate">
                                        <i className="bi bi-alarm me-2"></i>
                                        Gestión de Retrasos
                                    </h5>
                                    <Card>
                                        <Card.Body>
                                            <ul className="mb-0">
                                                <li><strong>Retraso 1-2 horas:</strong> Notificación inmediata</li>
                                                <li><strong>Retraso +2 horas:</strong> Reembolso 50% costo envío</li>
                                                <li><strong>Retraso +4 horas:</strong> Reembolso 100% costo envío</li>
                                                <li><strong>Cancelación nuestra:</strong> Reembolso total + voucher $5.000</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div className="mb-4">
                                    <h5 className="text-chocolate">
                                        <i className="bi bi-box-seam me-2"></i>
                                        Condiciones de Recepción
                                    </h5>
                                    <Card>
                                        <Card.Body>
                                            <ul className="mb-0">
                                                <li><strong>Verificación obligatoria:</strong> Revisar producto al recibir</li>
                                                <li><strong>Daños visibles:</strong> Rechazar y contactarnos inmediatamente</li>
                                                <li><strong>Temperatura:</strong> Productos refrigerados deben recibirse fríos</li>
                                                <li><strong>Embalaje:</strong> Verificar integridad del packaging</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="mb-4">
                                    <h5 className="text-chocolate">
                                        <i className="bi bi-person-check me-2"></i>
                                        Responsabilidades
                                    </h5>
                                    <Card>
                                        <Card.Body>
                                            <div className="row">
                                                <div className="col-6">
                                                    <strong className="text-success">Nuestra responsabilidad:</strong>
                                                    <ul className="small">
                                                        <li>Daños durante transporte</li>
                                                        <li>Incumplimiento de horarios</li>
                                                        <li>Productos incorrectos</li>
                                                    </ul>
                                                </div>
                                                <div className="col-6">
                                                    <strong className="text-warning">Responsabilidad del cliente:</strong>
                                                    <ul className="small">
                                                        <li>Informar dirección correcta</li>
                                                        <li>Disponibilidad para recepción</li>
                                                        <li>Almacenamiento post-entrega</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div className="mb-4">
                                    <h5 className="text-chocolate">
                                        <i className="bi bi-house-door me-2"></i>
                                        Ausencia del Receptor
                                    </h5>
                                    <Card>
                                        <Card.Body>
                                            <ul className="mb-0">
                                                <li><strong>1ra visita:</strong> Llamado de coordinación</li>
                                                <li><strong>2da visita:</strong> Reprogramación con costo $1.500</li>
                                                <li><strong>3ra visita:</strong> Producto regresa a bodega</li>
                                                <li><strong>Productos perecederos:</strong> No se guardan más de 24h</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* SECCIÓN PRODUCTOS PERECEDEROS */}
                    <Alert variant="warning">
                        <h5 className="alert-heading">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Importante: Productos Perecederos
                        </h5>
                        <p className="mb-0">
                            Por la naturaleza de nuestros productos, recomendamos:<br />
                            • <strong>Consumo inmediato</strong> post-entrega<br />
                            • <strong>Refrigeración</strong> si no se consume de inmediato (2-4°C)<br />
                            • <strong>No dejar</strong> a temperatura ambiente por más de 2 horas<br />
                            • <strong>Vida útil:</strong> 3-5 días refrigerado (consultar por producto específico)
                        </p>
                    </Alert>

                    {/* INFORMACIÓN DE COSTOS */}
                    <Card className="bg-light mb-4">
                        <Card.Body>
                            <h5 className="text-center text-chocolate mb-3">
                                <i className="bi bi-currency-dollar me-2"></i>
                                Resumen de Costos de Envío
                            </h5>
                            <Row>
                                <Col md={3} className="text-center">
                                    <div className="border-end border-chocolate">
                                        <h6 className="text-success">RM</h6>
                                        <p className="mb-0"><strong>$2.500</strong></p>
                                        <small className="text-muted">Gratis desde $40.000</small>
                                    </div>
                                </Col>
                                <Col md={3} className="text-center">
                                    <div className="border-end border-chocolate">
                                        <h6 className="text-info">Zona Centro</h6>
                                        <p className="mb-0"><strong>$3.000</strong></p>
                                        <small className="text-muted">Gratis desde $45.000</small>
                                    </div>
                                </Col>
                                <Col md={3} className="text-center">
                                    <div className="border-end border-chocolate">
                                        <h6 className="text-primary">Zona Sur</h6>
                                        <p className="mb-0"><strong>$4.000</strong></p>
                                        <small className="text-muted">Gratis desde $45.000</small>
                                    </div>
                                </Col>
                                <Col md={3} className="text-center">
                                    <h6 className="text-warning">Zona Norte</h6>
                                    <p className="mb-0"><strong>$4.000</strong></p>
                                    <small className="text-muted">Gratis desde $45.000</small>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* CONTACTO */}
                    <div className="text-center mt-4">
                        <Card className="border-chocolate">
                            <Card.Body>
                                <h5 className="text-chocolate">¿Necesitas ayuda con tu envío?</h5>
                                <Row>
                                    <Col md={4}>
                                        <i className="bi bi-whatsapp text-success fs-4"></i>
                                        <p className="mb-1"><strong>WhatsApp</strong></p>
                                        <p className="mb-0">+56 9 1234 5678</p>
                                    </Col>
                                    <Col md={4}>
                                        <i className="bi bi-envelope text-primary fs-4"></i>
                                        <p className="mb-1"><strong>Email</strong></p>
                                        <p className="mb-0">envios@milsabores.cl</p>
                                    </Col>
                                    <Col md={4}>
                                        <i className="bi bi-clock text-warning fs-4"></i>
                                        <p className="mb-1"><strong>Horario</strong></p>
                                        <p className="mb-0">Lunes a Sábado<br/>9:00 - 21:00 hrs</p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </div>

                </Col>
            </Row>
        </Container>
    );
};

export default EntregaEnvios;