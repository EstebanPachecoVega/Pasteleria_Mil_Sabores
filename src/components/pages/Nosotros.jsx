import React from 'react';
import { Container } from 'react-bootstrap';

const Nosotros = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Quienes Somos</h1>
      
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="about-content">
            <p className="lead">
              En <strong>Pastelería Mil Sabores</strong>, somos una empresa familiar dedicada a la creación de deliciosos productos de
              pastelería y repostería artesanal.
            </p>
            
            <p>
              Fundada en <strong>1995</strong>, nuestra misión es endulzar los momentos especiales de nuestros clientes con sabores
              auténticos y recetas tradicionales. Nuestro equipo está compuesto por pasteleros apasionados que utilizan 
              ingredientes de la más alta calidad para garantizar que cada bocado sea una experiencia inolvidable.
            </p>
            
            <p>
              Desde pasteles personalizados para celebraciones hasta una variedad de postres clásicos, nos esforzamos por
              ofrecer productos que no solo sean visualmente atractivos, sino que también deleiten el paladar.
            </p>
            
            <p>
              En Pastelería Mil Sabores, valoramos la satisfacción del cliente y nos comprometemos a brindar un servicio
              excepcional. Ya sea que estés buscando un pastel para tu boda, cupcakes para una fiesta de cumpleaños o 
              simplemente un dulce capricho, estamos aquí para ayudarte a hacer que cada ocasión sea especial.
            </p>
            
            <p className="fw-bold">
              Gracias por elegirnos para ser parte de tus momentos más dulces. ¡Esperamos endulzar tu día con nuestros
              productos!
            </p>
          </div>

          {/* Sección adicional con valores o características */}
          <div className="row my-5">
            <div className="col-md-4 text-center mb-3">
              <div className="about-feature">
                <i className="bi bi-heart-fill text-danger display-6"></i>
                <h5 className="mt-3">Pasión por lo Artesanal</h5>
                <p className="text-muted">Cada producto es elaborado con dedicación y amor</p>
              </div>
            </div>
            
            <div className="col-md-4 text-center mb-3">
              <div className="about-feature">
                <i className="bi bi-star-fill text-warning display-6"></i>
                <h5 className="mt-3">Calidad Premium</h5>
                <p className="text-muted">Ingredientes seleccionados para el mejor sabor</p>
              </div>
            </div>
            
            <div className="col-md-4 text-center mb-3">
              <div className="about-feature">
                <i className="bi bi-truck text-primary display-6"></i>
                <h5 className="mt-3">Entrega en Todo Chile</h5>
                <p className="text-muted">Llevamos la dulzura a cada rincón del país</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Nosotros;