import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card, Alert, FormCheck } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const ShippingInfo = ({ onNextStep, onPreviousStep, initialData }) => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    region: '',
    comuna: '',
    nombreCalle: '',
    numeroCalle: '',
    tipoVivienda: '',
    codigoPostal: '',
    notes: ''
  });
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [isModified, setIsModified] = useState(false);

  // Datos de regiones y comunas (deben coincidir con Profile.jsx)
  const regions = [
    { id: 1, name: 'Región Metropolitana' },
    { id: 2, name: 'Región de Valparaíso' },
    { id: 3, name: 'Región del Biobío' },
  ];

  const communes = {
    1: [
      { id: 1, name: 'Santiago' },
      { id: 2, name: 'Providencia' },
      { id: 3, name: 'Las Condes' },
      { id: 4, name: 'Ñuñoa' },
      { id: 5, name: 'Maipú' },
      { id: 6, name: 'Puente Alto' },
    ],
    2: [
      { id: 7, name: 'Valparaíso' },
      { id: 8, name: 'Viña del Mar' },
      { id: 9, name: 'Quilpué' }
    ],
    3: [
      { id: 10, name: 'Concepción' },
      { id: 11, name: 'Talcahuano' },
      { id: 12, name: 'Chiguayante' }
    ]
  };

  const tipoViviendaOptions = [
    { value: '', label: 'Selecciona tipo de vivienda' },
    { value: 'casa', label: 'Casa' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'local', label: 'Local Comercial' },
    { value: 'otro', label: 'Otro' }
  ];

  // Pre-llenar con datos del usuario
  useEffect(() => {
    if (currentUser) {
      const userData = {
        primerNombre: currentUser.primerNombre || currentUser.name?.split(' ')[0] || '',
        segundoNombre: currentUser.segundoNombre || '',
        primerApellido: currentUser.primerApellido || '',
        segundoApellido: currentUser.segundoApellido || '',
        email: currentUser.email || '',
        telefono: currentUser.telefono || '',
        region: currentUser.region || '',
        comuna: currentUser.comuna || '',
        nombreCalle: currentUser.nombreCalle || '',
        numeroCalle: currentUser.numeroCalle || '',
        tipoVivienda: currentUser.tipoVivienda || '',
        codigoPostal: currentUser.codigoPostal || '',
        notes: initialData.notes || ''
      };
      setFormData(userData);
    }
  }, [currentUser, initialData]);

  const getCommunesForRegion = () => {
    return communes[formData.region] || [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsModified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si el usuario quiere guardar en el perfil y hay cambios
    if (saveToProfile && currentUser && isModified) {
      try {
        // Construir nombre completo y dirección como en Profile.jsx
        const nameParts = [
          formData.primerNombre,
          formData.segundoNombre,
          formData.primerApellido,
          formData.segundoApellido
        ].filter(Boolean);

        const fullName = nameParts.join(' ');

        const direccionCompleta = `${formData.nombreCalle} ${formData.numeroCalle}${formData.tipoVivienda ? `, ${formData.tipoVivienda}` : ''
          }${formData.codigoPostal ? `, Código Postal: ${formData.codigoPostal}` : ''}`;

        const updateData = {
          ...formData,
          name: fullName,
          direccionCompleta: direccionCompleta
        };

        await updateProfile(updateData);
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        // Continuamos con el checkout aunque falle la actualización del perfil
      }
    }

    // Construir datos de envío para el checkout
    const shippingInfo = {
      // Información personal
      primerNombre: formData.primerNombre,
      segundoNombre: formData.segundoNombre,
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido,
      nombreCompleto: `${formData.primerNombre} ${formData.primerApellido}`.trim(),

      // Contacto
      email: formData.email,
      telefono: formData.telefono,

      // Ubicación
      region: formData.region,
      comuna: formData.comuna,
      nombreCalle: formData.nombreCalle,
      numeroCalle: formData.numeroCalle,
      tipoVivienda: formData.tipoVivienda,
      codigoPostal: formData.codigoPostal,

      // Dirección completa formateada
      direccionCompleta: `${formData.nombreCalle} ${formData.numeroCalle}${formData.tipoVivienda ? `, ${formData.tipoVivienda}` : ''
        }${formData.codigoPostal ? `, Código Postal: ${formData.codigoPostal}` : ''}`,

      // Notas adicionales
      notes: formData.notes
    };

    onNextStep({ shippingInfo });
  };

  return (
    <div className="shipping-info">
      <h4 className="mb-4">Información de Envío</h4>

      {currentUser && (
        <Alert variant="info" className="mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Se han cargado tus datos de perfil. Los cambios se guardarán en tu perfil si activas la opción below.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Información Personal */}
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3">Información Personal</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Primer Nombre *</Form.Label>
              <Form.Control
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                required
                maxLength={25}
              />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Segundo Nombre</Form.Label>
              <Form.Control
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                maxLength={25}
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Primer Apellido *</Form.Label>
              <Form.Control
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                required
                maxLength={25}
              />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Segundo Apellido</Form.Label>
              <Form.Control
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                maxLength={25}
              />
            </Col>
          </Row>
        </div>

        {/* Información de Contacto */}
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3">Información de Contacto</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="+56912345678"
              />
            </Col>
          </Row>
        </div>

        {/* Ubicación */}
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3">Ubicación</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Región *</Form.Label>
              <Form.Select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una región</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Comuna *</Form.Label>
              <Form.Select
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                required
                disabled={!formData.region}
              >
                <option value="">
                  {formData.region ? 'Selecciona una comuna' : 'Primero selecciona una región'}
                </option>
                {getCommunesForRegion().map(comuna => (
                  <option key={comuna.id} value={comuna.id}>
                    {comuna.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Nombre de Calle *</Form.Label>
              <Form.Control
                type="text"
                name="nombreCalle"
                value={formData.nombreCalle}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </Col>

            <Col md={4} className="mb-3">
              <Form.Label>Número *</Form.Label>
              <Form.Control
                type="text"
                name="numeroCalle"
                value={formData.numeroCalle}
                onChange={handleChange}
                required
                maxLength={10}
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Tipo de Vivienda</Form.Label>
              <Form.Select
                name="tipoVivienda"
                value={formData.tipoVivienda}
                onChange={handleChange}
              >
                {tipoViviendaOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Label>Código Postal</Form.Label>
              <Form.Control
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                maxLength={7}
              />
            </Col>
          </Row>

          {formData.nombreCalle && formData.numeroCalle && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>Dirección de envío:</strong><br />
              {formData.nombreCalle} {formData.numeroCalle}
              {formData.tipoVivienda && `, ${formData.tipoVivienda}`}
              {formData.codigoPostal && `, Código Postal: ${formData.codigoPostal}`}
              {formData.region && communes[formData.region] && (
                <>, {communes[formData.region].find(c => c.id == formData.comuna)?.name}, {regions.find(r => r.id == formData.region)?.name}</>
              )}
            </div>
          )}
        </div>

        {/* Notas adicionales */}
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3">Información Adicional</h6>
          <Form.Group className="mb-3">
            <Form.Label>Notas de entrega (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Instrucciones especiales para la entrega, horarios preferidos, etc."
            />
          </Form.Group>
        </div>

        {/* Opción para guardar en perfil */}
        {currentUser && (
          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="saveToProfile"
              name="saveToProfile"
              checked={saveToProfile}
              onChange={(e) => setSaveToProfile(e.target.checked)}
              label="Guardar esta información en mi perfil para futuras compras"
            />
          </Form.Group>
        )}

        <div className="checkout-actions">
          <Row>
            <Col>
              <Button
                variant="outline-secondary"
                onClick={onPreviousStep}
                className="me-3"
              >
                Volver al Resumen
              </Button>
              <Button
                type="submit"
                className="checkout-btn-primary"
              >
                Continuar con Pago
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default ShippingInfo;