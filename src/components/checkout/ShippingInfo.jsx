import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import {
  getRegions,
  getCommunesByRegion,
  getHousingTypes,
  getRegionName,
  getCommuneName
} from '../../services/firestoreService';

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

  // Estados para datos maestros firebase
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [tipoViviendaOptions, setTipoViviendaOptions] = useState([]);
  const [loading, setLoading] = useState({
    regions: true,
    communes: false,
    housing: true
  });
  const [error, setError] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [isModified, setIsModified] = useState(false);

  // cargar datos maestros al montar el componente desde firebase
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setError('');

        // Cargar regiones
        console.log('📡 Cargando regiones desde Firebase...');
        const regionsData = await getRegions();
        setRegions(regionsData);
        setLoading(prev => ({ ...prev, regions: false }));
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
        setLoading(prev => ({ ...prev, housing: false }));
        console.log('✅ Tipos de vivienda cargados:', housingTypesData.length);

      } catch (err) {
        console.error('❌ Error cargando datos maestros:', err);
        setError('Error al cargar datos de regiones y comunas. Por favor recarga la página.');
        setLoading({ regions: false, communes: false, housing: false });
      }
    };

    loadMasterData();
  }, []);

  // cargar datos del usuario al montar el componente o cuando cambia currentUser 
  // y cargar sus comunas si tiene región
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

      // Si el usuario tiene región, cargar sus comunas
      if (userData.region) {
        loadCommunesForRegion(userData.region);
      }
    }
  }, [currentUser, initialData]);

  // función para cargar comunas según región seleccionada
  const loadCommunesForRegion = async (regionId) => {
    if (!regionId) {
      setCommunes([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, communes: true }));
      console.log(`📡 Cargando comunas para región ${regionId}...`);

      const communesData = await getCommunesByRegion(regionId);
      setCommunes(communesData);

      console.log(`✅ Comunas cargadas: ${communesData.length} para región ${regionId}`);
      setLoading(prev => ({ ...prev, communes: false }));
    } catch (err) {
      console.error('❌ Error cargando comunas:', err);
      setError('Error al cargar las comunas de esta región.');
      setLoading(prev => ({ ...prev, communes: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsModified(true);

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
    setError('');

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

      // Actualizar perfil si es necesario
      if (saveToProfile && currentUser && isModified) {
        try {
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
            direccionCompleta: direccionCompleta
          };

          await updateProfile(updateData);
          console.log('✅ Perfil actualizado con nueva información');
        } catch (profileError) {
          console.warn('⚠️ Error al actualizar perfil, pero continuamos:', profileError);
          // No bloqueamos el flujo si falla la actualización del perfil
        }
      }

      // Preparar datos de envío para el siguiente paso
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
        regionName: regionName,
        comuna: formData.comuna,
        comunaName: comunaName,
        nombreCalle: formData.nombreCalle,
        numeroCalle: formData.numeroCalle,
        tipoVivienda: formData.tipoVivienda,
        tipoViviendaName: housingTypeName,
        codigoPostal: formData.codigoPostal,

        // Dirección completa formateada
        direccionCompleta: `${formData.nombreCalle} ${formData.numeroCalle}${formData.tipoVivienda ? `, ${housingTypeName}` : ''}${formData.codigoPostal ? `, Código Postal: ${formData.codigoPostal}` : ''}`,

        // Notas adicionales
        notes: formData.notes
      };

      // DEBUG - VERIFICAR QUÉ SE ESTÁ ENVIANDO
      console.log('🔍 DEBUG - ShippingInfo a enviar:', JSON.stringify(shippingInfo, null, 2));

      onNextStep({ shippingInfo });

    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      setError('Error al procesar la información. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="shipping-info">
      <h4 className="mb-4">Información de Envío</h4>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

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

          {/* Región */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Región *</Form.Label>
              {loading.regions ? (
                <div className="d-flex align-items-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Cargando regiones...</span>
                </div>
              ) : (
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
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Comuna *</Form.Label>
              {loading.communes ? (
                <div className="d-flex align-items-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Cargando comunas...</span>
                </div>
              ) : (
                <Form.Select
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  required
                  disabled={!formData.region || communes.length === 0}
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
              )}
            </Col>
          </Row>

          {/* Dirección */}
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

          {/* Tipo de Vivienda y Código Postal */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Tipo de Vivienda</Form.Label>
              {loading.housing ? (
                <div className="d-flex align-items-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Cargando tipos...</span>
                </div>
              ) : (
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
              )}
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

          {/* Vista Previa de Dirección */}
          {formData.nombreCalle && formData.numeroCalle && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>Dirección de envío:</strong><br />
              {formData.nombreCalle} {formData.numeroCalle}
              {formData.tipoVivienda && `, ${tipoViviendaOptions.find(t => t.value === formData.tipoVivienda)?.label}`}
              {formData.codigoPostal && `, Código Postal: ${formData.codigoPostal}`}
              {formData.region && formData.comuna && (
                <>, {communes.find(c => c.id === formData.comuna)?.name}, {regions.find(r => r.id === formData.region)?.name}</>
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
                disabled={loading.regions || loading.communes || loading.housing}
              >
                {loading.regions || loading.communes || loading.housing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Cargando...
                  </>
                ) : (
                  'Continuar con Pago'
                )}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default ShippingInfo;