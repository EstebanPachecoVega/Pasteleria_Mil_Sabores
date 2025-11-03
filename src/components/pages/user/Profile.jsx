import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { getSpecialDiscounts } from '../../../data/users';
import {
  getRegions,
  getCommunesByRegion,
  getHousingTypes,
  getRegionName,
  getCommuneName
} from '../../../services/firestoreService';

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

  // Estados para datos maestros firebase
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [tipoViviendaOptions, setTipoViviendaOptions] = useState([]);
  const [loadingData, setLoadingData] = useState({
    regions: true,
    communes: false,
    housing: true
  });

  // cargar datos maestros al montar el componente desde firebase
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setError('');

        // Cargar regiones
        console.log('📡 Cargando regiones desde Firebase...');
        const regionsData = await getRegions();
        setRegions(regionsData);
        setLoadingData(prev => ({ ...prev, regions: false }));
        console.log('✅ Regiones cargadas:', regionsData.length);

        // Cargar tipos de vivienda
        console.log('📡 Cargando tipos de vivienda desde Firebase...');
        const housingTypesData = await getHousingTypes();
        const housingOptions = [
          { value: '', label: 'Selecciona tipo de vivienda' },
          ...housingTypesData.map(type => ({
            value: type.id.toString(),
            label: type.name
          }))
        ];
        setTipoViviendaOptions(housingOptions);
        setLoadingData(prev => ({ ...prev, housing: false }));
        console.log('✅ Tipos de vivienda cargados:', housingTypesData.length);

      } catch (err) {
        console.error('❌ Error cargando datos maestros:', err);
        setError('Error al cargar datos de regiones y comunas. Por favor recarga la página.');
        setLoadingData({ regions: false, communes: false, housing: false });
      }
    };

    loadMasterData();
  }, []);

  // cargar datos del usuario al montar el componente o cuando cambia currentUser 
  // y cargar sus comunas si tiene región
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
        direccionCompleta: currentUser.direccionCompleta || '',
        regionName: currentUser.regionName || '',
        comunaName: currentUser.comunaName || '',
        tipoViviendaName: currentUser.tipoViviendaName || ''
      };

      setFormData(userData);
      setOriginalData(userData);
      setSpecialDiscounts(getSpecialDiscounts(currentUser));

      // Si el usuario tiene región, cargar sus comunas - con un pequeño delay para asegurar que regions ya se cargó
      if (userData.region) {
        const loadUserCommunes = async () => {
          // Pequeño delay para asegurar que las regions ya están cargadas
          await new Promise(resolve => setTimeout(resolve, 100));
          loadCommunesForRegion(userData.region);
        };
        loadUserCommunes();
      }
    }
    console.log('👤 Datos actuales del usuario:', {
      region: currentUser.region,
      comuna: currentUser.comuna,
      regionName: currentUser.regionName,
      comunaName: currentUser.comunaName,
      direccionCompleta: currentUser.direccionCompleta
    });

  }, [currentUser, regions]);

  // función para cargar comunas según región seleccionada
  const loadCommunesForRegion = async (regionId) => {
    if (!regionId) {
      setCommunes([]);
      return;
    }

    try {
      setLoadingData(prev => ({ ...prev, communes: true }));
      console.log(`📡 Cargando comunas para región ${regionId}...`);

      const communesData = await getCommunesByRegion(regionId);

      // Asegurarse de que communesData es un array válido
      if (communesData && Array.isArray(communesData)) {
        setCommunes(communesData);
        console.log(`✅ Comunas cargadas: ${communesData.length} para región ${regionId}`);
      } else {
        console.warn('⚠️ No se recibieron datos de comunas válidos');
        setCommunes([]);
      }

      setLoadingData(prev => ({ ...prev, communes: false }));
    } catch (err) {
      console.error('❌ Error cargando comunas:', err);
      setError('Error al cargar las comunas de esta región.');
      setCommunes([]);
      setLoadingData(prev => ({ ...prev, communes: false }));
    }
  };

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

    // Si tenía región, recargar sus comunas
    if (originalData.region) {
      loadCommunesForRegion(originalData.region);
    } else {
      setCommunes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia la región, resetear comuna y cargar nuevas comunas
    if (name === 'region') {
      setFormData(prev => ({
        ...prev,
        comuna: ''
      }));
      loadCommunesForRegion(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // Obtener nombres de región, comuna y tipo de vivienda desde Firebase
      let regionName = '';
      let comunaName = '';
      let housingTypeName = '';

      if (formData.region) {
        regionName = await getRegionName(formData.region);
      }

      if (formData.comuna && formData.region) {
        comunaName = await getCommuneName(formData.comuna);
      }

      if (formData.tipoVivienda) {
        const housingType = tipoViviendaOptions.find(t => t.value === formData.tipoVivienda);
        housingTypeName = housingType ? housingType.label : formData.tipoVivienda;
      }

      const nameParts = [
        formData.primerNombre,
        formData.segundoNombre,
        formData.primerApellido,
        formData.segundoApellido
      ].filter(Boolean);

      const fullName = nameParts.join(' ');

      const direccionCompleta = `${formData.nombreCalle} ${formData.numeroCalle}${formData.tipoVivienda ? `, ${housingTypeName}` : ''}${formData.codigoPostal ? `, Código Postal: ${formData.codigoPostal}` : ''}`;

      const updateData = {
        ...formData,
        name: fullName,
        direccionCompleta: direccionCompleta,
        regionName: regionName,
        comunaName: comunaName,
        tipoViviendaName: housingTypeName
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

  // funciones para mostrar nombres de región, comuna y tipo de vivienda
  const getRegionNameForDisplay = (regionId) => {
    if (!regionId) return '';

    // Buscar en regions cargadas
    const region = regions.find(r => r.id === regionId);
    if (region) return region.name;

    // Si no encuentra, usar el nombre guardado en el usuario (si existe)
    if (currentUser.regionName) return currentUser.regionName;

    return '';
  };

  const getComunaNameForDisplay = (comunaId) => {
    if (!comunaId) return '';

    // Buscar en communes cargadas
    const comuna = communes.find(c => c.id === comunaId);
    if (comuna) return comuna.name;

    // Si no encuentra, usar el nombre guardado en el usuario (si existe)
    if (currentUser.comunaName) return currentUser.comunaName;

    return '';
  };

  const getTipoViviendaLabelForDisplay = (value) => {
    if (!value) return '';
    const option = tipoViviendaOptions.find(opt => opt.value === value);
    if (option) return option.label;

    // Si no encuentra, usar el nombre guardado en el usuario
    if (currentUser.tipoViviendaName) return currentUser.tipoViviendaName;

    return '';
  };

  if (!currentUser) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Debes iniciar sesión para ver tu perfil</Alert>
      </Container>
    );
  }

  console.log('🔍 Debug datos:', {
    userRegion: formData.region,
    userComuna: formData.comuna,
    regionsCount: regions.length,
    communesCount: communes.length,
    foundRegion: getRegionNameForDisplay(formData.region),
    foundComuna: getComunaNameForDisplay(formData.comuna)
  });

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
                      loadingData.regions ? (
                        <div className="d-flex align-items-center">
                          <Spinner animation="border" size="sm" className="me-2" />
                          <span>Cargando regiones...</span>
                        </div>
                      ) : (
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
                      )
                    ) : (
                      <div className="profile-field-value">
                        {getRegionNameForDisplay(formData.region) || 'No especificada'}
                      </div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="profile-label">Comuna</Form.Label>
                    {isEditing ? (
                      loadingData.communes ? (
                        <div className="d-flex align-items-center">
                          <Spinner animation="border" size="sm" className="me-2" />
                          <span>Cargando comunas...</span>
                        </div>
                      ) : (
                        <Form.Select
                          name="comuna"
                          value={formData.comuna}
                          onChange={handleChange}
                          disabled={!formData.region || communes.length === 0}
                          className="profile-select"
                        >
                          <option value="">
                            {!formData.region
                              ? 'Primero selecciona una región'
                              : communes.length === 0
                                ? 'No hay comunas disponibles'
                                : 'Selecciona una comuna'
                            }
                          </option>
                          {communes.map(comuna => (
                            <option key={comuna.id} value={comuna.id}>
                              {comuna.name}
                            </option>
                          ))}
                        </Form.Select>
                      )
                    ) : (
                      <div className="profile-field-value">
                        {getComunaNameForDisplay(formData.comuna) || 'No especificada'}
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
                      loadingData.housing ? (
                        <div className="d-flex align-items-center">
                          <Spinner animation="border" size="sm" className="me-2" />
                          <span>Cargando tipos...</span>
                        </div>
                      ) : (
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
                      )
                    ) : (
                      <div className="profile-field-value">
                        {getTipoViviendaLabelForDisplay(formData.tipoVivienda) || 'No especificado'}
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