import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { getSpecialDiscounts } from '../../../data/users';


const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    birthDate: '',
    telefono: '',
    region: '',
    comuna: '',
    nombreCalle: '',
    numeroCalle: '',
    tipoVivienda: '',
    codigoPostal: '',
    direccionCompleta: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [specialDiscounts, setSpecialDiscounts] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo para regiones y comunas
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

  useEffect(() => {
    if (currentUser) {
      const userData = {
        primerNombre: currentUser.primerNombre || '',
        segundoNombre: currentUser.segundoNombre || '',
        primerApellido: currentUser.primerApellido || '',
        segundoApellido: currentUser.segundoApellido || '',
        email: currentUser.email || '',
        birthDate: currentUser.birthDate || '',
        telefono: currentUser.telefono || '',
        region: currentUser.region || '',
        comuna: currentUser.comuna || '',
        nombreCalle: currentUser.nombreCalle || '',
        numeroCalle: currentUser.numeroCalle || '',
        tipoVivienda: currentUser.tipoVivienda || '',
        codigoPostal: currentUser.codigoPostal || '',
        direccionCompleta: currentUser.direccionCompleta || ''
      };

      setFormData(userData);
      setOriginalData(userData);
      setSpecialDiscounts(getSpecialDiscounts(currentUser));
    }
  }, [currentUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
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
      setOriginalData(formData);
      setMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      setSpecialDiscounts(getSpecialDiscounts({ ...currentUser, ...updateData }));
    } catch (err) {
      setError('Error al actualizar el perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCommunesForRegion = () => {
    return communes[formData.region] || [];
  };

  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id == regionId);
    return region ? region.name : '';
  };

  const getComunaName = (comunaId) => {
    const regionCommunes = communes[formData.region] || [];
    const comuna = regionCommunes.find(c => c.id == comunaId);
    return comuna ? comuna.name : '';
  };

  const getTipoViviendaLabel = (value) => {
    const option = tipoViviendaOptions.find(opt => opt.value === value);
    return option ? option.label : '';
  };

  if (!currentUser) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Debes iniciar sesión para ver tu perfil</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="profile-title mb-0">Mi Perfil</h4>
              {!isEditing && (
                <Button variant="outline-primary" onClick={handleEdit} className="profile-edit-btn">
                  <i className="bi bi-pencil me-2"></i>
                  Editar Perfil
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Información Personal */}
                <h5 className="profile-section-title my-3 border-bottom pb-2">
                  <i className="bi bi-person-circle me-2"></i>Información Personal
                </h5>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Primer Nombre</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="primerNombre"
                        value={formData.primerNombre}
                        onChange={handleChange}
                        required
                        maxLength={25}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.primerNombre || 'No especificado'}
                      </div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Segundo Nombre</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="segundoNombre"
                        value={formData.segundoNombre}
                        onChange={handleChange}
                        maxLength={25}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.segundoNombre || 'No especificado'}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Primer Apellido</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="primerApellido"
                        value={formData.primerApellido}
                        onChange={handleChange}
                        required
                        maxLength={25}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.primerApellido || 'No especificado'}
                      </div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Segundo Apellido</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="segundoApellido"
                        value={formData.segundoApellido}
                        onChange={handleChange}
                        maxLength={25}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.segundoApellido || 'No especificado'}
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Información de Contacto */}
                <h5 className="profile-section-title my-3 border-bottom pb-2">
                  <i className="bi bi-envelope me-2"></i>Información de Contacto
                </h5>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Email</Form.Label>
                    <div className="profile-field-value profile-email">
                      {formData.email}
                    </div>
                    {isEditing && (
                      <Form.Text className="text-muted">
                        El email no se puede modificar
                      </Form.Text>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Teléfono</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+56912345678"
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.telefono || 'No especificado'}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Fecha de Nacimiento</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.birthDate || 'No especificada'}
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Ubicación */}
                <h5 className="profile-section-title my-3 border-bottom pb-2">
                  <i className="bi bi-geo-alt me-2"></i>Ubicación
                </h5>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Región</Form.Label>
                    {isEditing ? (
                      <Form.Select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="profile-select"
                      >
                        <option value="">Selecciona una región</option>
                        {regions.map(region => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <div className="profile-field-value">
                        {getRegionName(formData.region) || 'No especificada'}
                      </div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Comuna</Form.Label>
                    {isEditing ? (
                      <Form.Select
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleChange}
                        disabled={!formData.region}
                        className="profile-select"
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
                    ) : (
                      <div className="profile-field-value">
                        {getComunaName(formData.comuna) || 'No especificada'}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Nombre de Calle</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="nombreCalle"
                        value={formData.nombreCalle}
                        onChange={handleChange}
                        maxLength={100}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.nombreCalle || 'No especificada'}
                      </div>
                    )}
                  </Col>

                  <Col md={4} className="mb-3">
                    <Form.Label className="profile-label">Número</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="numeroCalle"
                        value={formData.numeroCalle}
                        onChange={handleChange}
                        maxLength={10}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.numeroCalle || 'No especificado'}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Tipo de Vivienda</Form.Label>
                    {isEditing ? (
                      <Form.Select
                        name="tipoVivienda"
                        value={formData.tipoVivienda}
                        onChange={handleChange}
                        className="profile-select"
                      >
                        {tipoViviendaOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <div className="profile-field-value">
                        {getTipoViviendaLabel(formData.tipoVivienda) || 'No especificado'}
                      </div>
                    )}
                  </Col>

                  <Col md={4} className="mb-3">
                    <Form.Label className="profile-label">Código Postal</Form.Label>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleChange}
                        maxLength={7}
                      />
                    ) : (
                      <div className="profile-field-value">
                        {formData.codigoPostal || 'No especificado'}
                      </div>
                    )}
                  </Col>
                </Row>

                {formData.direccionCompleta && (
                  <div className="mb-3">
                    <Form.Label className="profile-label">Dirección Completa</Form.Label>
                    <div className="profile-field-value profile-address">
                      {formData.direccionCompleta}
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                {isEditing && (
                  <div className="d-flex gap-2 mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="profile-submit-btn"
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                      className="profile-cancel-btn"
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Cancelar
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Mis Beneficios</h5>
            </Card.Header>
            <Card.Body>
              {specialDiscounts && (
                <div className="benefits-list">
                  {specialDiscounts.seniorDiscount && (
                    <div className="benefit-item d-flex align-items-center mb-3 p-2 bg-warning bg-opacity-10 rounded">
                      <i className="bi bi-coin text-warning fs-4 me-3"></i>
                      <div>
                        <h6 className="mb-1">50% Descuento</h6>
                        <small className="text-muted">Por ser mayor de 50 años</small>
                      </div>
                    </div>
                  )}

                  {specialDiscounts.codeDiscount && (
                    <div className="benefit-item d-flex align-items-center mb-3 p-2 bg-success bg-opacity-10 rounded">
                      <i className="bi bi-tag text-success fs-4 me-3"></i>
                      <div>
                        <h6 className="mb-1">10% Descuento Permanente</h6>
                        <small className="text-muted">Código FELICES50</small>
                      </div>
                    </div>
                  )}

                  {currentUser.email.includes('@duoc.cl') && (
                    <div className="benefit-item d-flex align-items-center mb-3 p-2 bg-info bg-opacity-10 rounded">
                      <i className="bi bi-gift text-info fs-4 me-3"></i>
                      <div>
                        <h6 className="mb-1">Torta Gratis</h6>
                        <small className="text-muted">Estudiante Duoc - En tu cumpleaños</small>
                        {specialDiscounts.birthdayDiscount && (
                          <Badge bg="success" className="ms-2">¡Hoy es tu cumpleaños!</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {!specialDiscounts.seniorDiscount &&
                    !specialDiscounts.codeDiscount &&
                    !currentUser.email.includes('@duoc.cl') && (
                      <p className="text-muted text-center mb-0">
                        Completa tu perfil para descubrir beneficios
                      </p>
                    )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;