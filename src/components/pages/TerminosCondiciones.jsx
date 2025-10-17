import React from 'react';
import { Container } from 'react-bootstrap';

const TerminosCondiciones = () => {
    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">Términos y Condiciones</h1>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="terms-content">
                        <p><strong>Última actualización:</strong> [DD/MM/YYYY]</p>

                        <h2>1. Identificación</h2>
                        <p>
                            <strong>Empresa:</strong> Pastelería Mil Sabores<br />
                            <strong>RUT:</strong> [RUT]<br />
                            <strong>Correo:</strong> <a href="mailto:email@dominio.cl">email@milsabores.cl</a><br />
                            <strong>Dirección:</strong> [Dirección completa]
                        </p>

                        <h2>2. Aceptación</h2>
                        <p>Al usar este sitio y comprar, aceptas estos Términos y Condiciones.</p>

                        <h2>3. Productos, precios y disponibilidad</h2>
                        <p>Los precios publicados podrán cambiar y la disponibilidad está sujeta a stock.</p>

                        <h2>4. Pedido y confirmación</h2>
                        <p>Recibirás una confirmación por correo con los detalles del pedido.</p>

                        <h2>5. Pagos</h2>
                        <p>Aceptamos los medios de pago indicados en el sitio. Los pagos se procesan con los proveedores indicados.</p>

                        <h2>6. Envíos y entregas</h2>
                        <p>Los plazos dependen de la modalidad elegida y de la comuna de entrega. Los costos se informan antes de finalizar la compra.</p>

                        <h2>7. Derecho a retracto</h2>
                        <p>
                            En compras a distancia, tienes derecho a retractarte en 10 días desde la recepción del producto,
                            salvo excepciones por la naturaleza del bien (p. ej. productos perecibles o personalizados).
                            Para más detalle revisa nuestra política de devoluciones.
                        </p>

                        <h2>8. Devoluciones y garantía</h2>
                        <p>
                            Si el producto tiene defecto, contacta a <a href="mailto:email@dominio.cl">email@milsabores.cl</a> con
                            fotos y número de pedido. La garantía legal permite exigir reparación, cambio o devolución conforme a la ley.
                        </p>

                        <h2>9. Protección de datos</h2>
                        <p>
                            Tratamos tus datos conforme a la Ley N° 19.628. Revisa nuestra Política de Privacidad para más información.
                        </p>

                        <h2>10. Legislación y reclamos</h2>
                        <p>
                            Estos términos se rigen por la ley chilena. Para reclamos puedes acudir a SERNAC u organismo competente.
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default TerminosCondiciones;