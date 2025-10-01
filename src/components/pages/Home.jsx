// src/components/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import FeaturedProducts from '../common/FeaturedProducts';

const Home = () => {
    return (
        <div className="container mt-4">
            {/* Hero Section */}
            <section className="store-hero my-5">
                <div className="row align-items-center g-4">
                    <div className="col-12 col-md-6">
                        <h2 className="display-4">Pastelería Mil Sabores</h2>
                        <p className="mb-3">
                            Celebra cada momento con la dulzura única de nuestra repostería artesanal,
                            preparada con ingredientes seleccionados para conquistar todos los paladares.
                            Desde tortas personalizadas hasta empanaditas, pies, cupcakes y opciones sin gluten,
                            cada creación está pensada para sorprenderte con calidad, frescura y sabor en cada bocado.
                            <span className="d-block mt-2 fw-bold">¡Y lo mejor, llegamos a todo Chile!</span>
                        </p>

                        <div className="d-flex flex-wrap gap-2">
                            <Link to="/productos" className="btn ver-productos-btn btn-lg" role="button">
                                Ver todos
                            </Link>
                            <Link to="/contacto" className="btn btn-outline-secondary btn-lg">
                                Contáctanos
                            </Link>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 text-center">
                        <figure className="m-0">
                            <img
                                src="/images/hero/hero_pasteleria_mil_sabores.png"
                                alt="Mostrador con pasteles y repostería de Pastelería Mil Sabores"
                                className="img-fluid store-hero-img rounded shadow"
                            />
                        </figure>
                    </div>
                </div>
            </section>

            {/* Productos Destacados */}
            <FeaturedProducts />
        </div>
    );
};

export default Home;