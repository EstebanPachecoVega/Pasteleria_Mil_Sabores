import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-footer py-4 mt-5" role="contentinfo">
      <div className="container">
        <div className="row g-4">
          {/* Información de Compañia */}
          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h5>Pastelería Mil Sabores</h5>
            <p>La mejor pastelería artesanal en Chile, endulzando tus momentos especiales desde 1995.</p>
            <div className="icon-social-red d-flex gap-3 mt-3">
              <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="https://www.instagram.com/pasteleriamilsaboresoficial/" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>

          {/* Columna de Links 1 */}
          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h5>Enlaces Rápidos</h5>
            <ul className="list-unstyled footer-links">
              <li><a href="/">Inicio</a></li>
              <li><a href="/nosotros">Quienes Somos</a></li>
              <li><a href="/contacto">Contáctanos</a></li>
            </ul>
          </div>

          {/* Columna de Links 2 */}
          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h5>Políticas</h5>
            <ul className="list-unstyled footer-links">
              <li><a href="/terminos-y-condiciones">Términos y Condiciones</a></li>
              <li><a href="/privacidad-y-seguridad">Políticas de Privacidad y Seguridad</a></li>
              <li><a href="/devolucion-y-reembolso">Políticas de Devolución y Reembolso</a></li>
              <li><a href="/seguridad-en-redes">Seguridad en Redes Sociales</a></li>
            </ul>
          </div>

          {/* Contacto y Pago */}
          <div className="col-12 col-md-6 col-lg-3 footer-column">
            <h5>Contacto e Información</h5>
            <p><i className="bi bi-geo-alt-fill"></i> Calle Principal 123, Santiago</p>

            <h5 className="mt-4">Formas de Pago</h5>
            <div className="payment-methods">
              <i className="bi bi-credit-card"></i>
              <i className="bi bi-paypal"></i>
              <i className="bi bi-cash-coin"></i>
              <i className="bi bi-wallet2"></i>
            </div>

            <ul className="list-unstyled footer-links">
              <li><a href="/informacion-de-envios">Información de Envíos</a></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divisor my-5" />

        <div className="row">
          <div className="container text-center">
            <p className="footer-copyrigth mb-0">
              © 2025 Pastelería Mil Sabores. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer