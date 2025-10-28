import React, { useState } from 'react';
import { Button, Card, Alert, Spinner } from 'react-bootstrap';
import populateFirebaseData from '../../scripts/populateFirebaseData';

const PopulateFirebaseData = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePopulate = async () => {
    if (!window.confirm('¿Estás seguro de que quieres poblar los datos en Firebase? Esto solo debe hacerse una vez.')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await populateFirebaseData();
      setMessage('¡Datos poblados exitosamente en Firebase! Ya puedes eliminar este componente.');
    } catch (err) {
      setError('Error al poblar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="my-4">
      <Card.Header className="bg-warning">
        <h5 className="mb-0">🏗️ Poblar Datos Firebase (USO ÚNICO)</h5>
      </Card.Header>
      <Card.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p className="text-muted">
          <strong>⚠️ IMPORTANTE:</strong> Este componente solo debe usarse UNA VEZ para crear la estructura inicial de la base de datos.
          Después de usarlo, debes eliminarlo de tu código.
        </p>
        
        <div className="d-grid gap-2">
          <Button 
            variant="warning" 
            onClick={handlePopulate} 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Poblando datos...
              </>
            ) : (
              '🏗️ Poblar Datos en Firebase'
            )}
          </Button>
        </div>

        <div className="mt-3 p-3 bg-light rounded">
          <h6>📊 Datos que se crearán:</h6>
          <ul className="mb-0">
            <li>16 Regiones de Chile</li>
            <li>~200 Comunas estratégicas</li>
            <li>5 Tipos de vivienda</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PopulateFirebaseData;