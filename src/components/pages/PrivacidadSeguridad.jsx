import React from 'react';
import { Container } from 'react-bootstrap';

const PrivacidadSeguridad = () => {
    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">Política de Privacidad y Seguridad</h1>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="privacy-content">
                        <p><strong>Última actualización:</strong> [DD/MM/YYYY]</p>

                        <h2>1. Alcance</h2>
                        <p>Esta Política informa sobre la recolección, uso, protección y conservación de tus datos personales.</p>

                        <h2>2. Datos que recopilamos</h2>
                        <p>Recolectamos información como nombre, correo, dirección, teléfono y datos de pago para procesar tu compra, y datos automáticos como IP y cookies para mejorar la experiencia.</p>

                        <h2>3. Finalidad del uso</h2>
                        <p>Usamos tus datos para procesar pedidos, pagos, entregas y enviar comunicaciones promocionales solo si das tu consentimiento.</p>

                        <h2>4. Consentimiento y transparencia</h2>
                        <p>Obtendremos tu consentimiento ajustado a normas legales, informándote claramente sobre el uso de tus datos.</p>

                        <h2>5. Conservación de datos</h2>
                        <p>Conservamos los datos solo lo necesario y los eliminamos o anonimamos después de ese plazo.</p>

                        <h2>6. Seguridad</h2>
                        <p>Contamos con medidas técnicas y organizativas para proteger los datos contra accesos o pérdidas no autorizadas.</p>

                        <h2>7. Compartición</h2>
                        <p>Compartimos datos con terceros si es necesario y siempre bajo confidencialidad y estándares de seguridad.</p>

                        <h2>8. Tus derechos</h2>
                        <p>Podrás ejercer derechos como acceso, rectificación, eliminación, oposición o revocar tu consentimiento contactándonos a los canales indicados.</p>

                        <h2>9. Normativa aplicable</h2>
                        <p>Esta Política está basada en la Ley 19.628 y adapta principios de la futura Ley 21.719.</p>

                        <h2>10. Contacto</h2>
                        <p>
                            Correo: <a href="mailto:email@dominio.cl">email@milsabores.cl</a><br />
                            Teléfono: +56 9 1234 5678<br />
                            Dirección: [Dirección completa]
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default PrivacidadSeguridad;