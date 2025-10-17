import React from 'react';
import { Container } from 'react-bootstrap';

const CalidadInocuidad = () => {
    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">Política de Calidad e Inocuidad</h1>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="quality-content">
                        <h2>1. Estándares de Calidad</h2>
                        <p>Cumplimos con los más altos estándares de calidad e higiene según normativas MINSAL.</p>

                        <h2>2. Ingredientes Premium</h2>
                        <p>Utilizamos únicamente ingredientes frescos y de primera calidad.</p>

                        <h2>3. Vida Útil y Consumo</h2>
                        <p>• Tortas: 3-5 días refrigeradas<br />
                            • Postres individuales: 2-3 días<br />
                            • Productos sin conservantes</p>

                        <h2>4. Alérgenos e Información Nutricional</h2>
                        <p>Proporcionamos información detallada sobre alérgenos en cada producto.</p>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default CalidadInocuidad;