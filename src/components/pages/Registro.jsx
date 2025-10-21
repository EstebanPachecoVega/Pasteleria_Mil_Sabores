import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { addUser } from '../../services/firestoreService';
import { validarCorreo, validarRun, esMayorEdad } from '../../utils/validations';

const Registro = () => {
    const [formData, setFormData] = useState({
        run: '',
        discountCode: '',
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        region: '',
        comuna: '',
        nombreCalle: '',
        numeroCalle: '',
        tipoVivienda: '',
        codigoPostal: '',
        terms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const navigate = useNavigate();

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
            { id: 5, name: 'Maipú' }
        ],
        2: [
            { id: 6, name: 'Valparaíso' },
            { id: 7, name: 'Viña del Mar' },
            { id: 8, name: 'Quilpué' }
        ],
        3: [
            { id: 9, name: 'Concepción' },
            { id: 10, name: 'Talcahuano' },
            { id: 11, name: 'Chiguayante' }
        ]
    };

    // Opciones para tipo de vivienda
    const tipoViviendaOptions = [
        { value: '', label: 'Selecciona tipo de vivienda' },
        { value: 'casa', label: 'Casa' },
        { value: 'departamento', label: 'Departamento' },
        { value: 'oficina', label: 'Oficina' },
        { value: 'local', label: 'Local Comercial' },
        { value: 'otro', label: 'Otro' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newValue = type === 'checkbox' ? checked : value;

        // Formatear RUN mientras se escribe (solo números y K)
        if (name === 'run') {
            newValue = value.replace(/[^\dkK]/gi, '').toUpperCase().slice(0, 9);
        }
        
        setFormData({
            ...formData,
            [name]: newValue
        });

        // Limpiar errores cuando el usuario escribe
        setError('');
        if (fieldErrors[name]) {
            const newErrors = { ...fieldErrors };
            delete newErrors[name];
            setFieldErrors(newErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        // ✅ VALIDACIONES USANDO LAS FUNCIONES DE TU PROFESORA
        const runFormateado = formData.run.trim().toUpperCase();

        if (!validarRun(runFormateado)) {
            setError('RUN incorrecto. Debe tener 8 dígitos + número o K verificador');
            setValidated(true);
            return;
        }

        if (!formData.primerNombre.trim()) {
            setError('El primer nombre es obligatorio');
            setValidated(true);
            return;
        }

        if (!formData.primerApellido.trim()) {
            setError('El primer apellido es obligatorio');
            setValidated(true);
            return;
        }

        if (!validarCorreo(formData.email)) {
            setError('El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com');
            setValidated(true);
            return;
        }

        if (!formData.birthDate || !esMayorEdad(formData.birthDate)) {
            setError('Debe ser mayor de 18 años para registrarse');
            setValidated(true);
            return;
        }

        if (formData.password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            setValidated(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setValidated(true);
            return;
        }

        if (!formData.terms) {
            setError('Debes aceptar los términos y condiciones');
            setValidated(true);
            return;
        }

        setError('');
        setLoading(true);
        setValidated(true);

        try {
            // ✅ USANDO EL SERVICIO addUser DE TU PROFESORA
            const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre || ''} ${formData.primerApellido} ${formData.segundoApellido || ''}`.trim().replace(/\s+/g, ' ');

            await addUser({
                run: runFormateado,
                nombre: nombreCompleto,
                correo: formData.email,
                clave: formData.password,
                fecha: formData.birthDate,
                // Campos adicionales que quieras guardar
                telefono: formData.telefono || '',
                discountCode: formData.discountCode || '',
                region: formData.region || '',
                comuna: formData.comuna || '',
                direccion: `${formData.nombreCalle || ''} ${formData.numeroCalle || ''}`.trim(),
                tipoVivienda: formData.tipoVivienda || '',
                codigoPostal: formData.codigoPostal || ''
            });

            // Éxito - mostrar mensaje y redirigir
            setError('');
            
            // Redirección como en el código de tu profesora
            setTimeout(() => {
                if (formData.email.toLowerCase() === 'admin@duoc.cl') {
                    navigate('/perfil-admin');
                } else {
                    navigate('/perfil');
                }
            }, 1000);

        } catch (err) {
            console.error('Error al guardar usuario: ', err);
            setError('Error al guardar usuario en Firebase');
        } finally {
            setLoading(false);
        }
    };

    const getCommunesForRegion = () => {
        return communes[formData.region] || [];
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="card-title mb-0">
                                <i className="bi bi-person-plus me-2"></i>Crear Cuenta
                            </h4>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" className="mb-4">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            <Form
                                noValidate
                                validated={validated}
                                onSubmit={handleSubmit}
                                id="registerForm"
                            >
                                {/* Sección de información personal */}
                                <h5 className="mb-3 border-bottom pb-2">
                                    <i className="bi bi-person-circle me-2"></i>Información Personal
                                </h5>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerRun">
                                            RUN <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerRun"
                                            name="run"
                                            value={formData.run}
                                            onChange={handleChange}
                                            placeholder="123456789 (sin guión)"
                                            required
                                            maxLength={9}
                                            isInvalid={validated && error.includes('RUN')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            RUN incorrecto
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Ingresa tu RUN completo (8 dígitos + dígito verificador sin guión)
                                        </Form.Text>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerDiscountCode">
                                            Código de Descuento (opcional)
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerDiscountCode"
                                            name="discountCode"
                                            value={formData.discountCode}
                                            onChange={handleChange}
                                            placeholder="Ej: PROMO2025"
                                        />
                                        <Form.Text className="text-muted">
                                            Si tienes código de descuento para registro
                                        </Form.Text>
                                    </Col>
                                </Row>

                                {/* Campos separados para nombres y apellidos */}
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerPrimerNombre">
                                            Primer Nombre <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerPrimerNombre"
                                            name="primerNombre"
                                            value={formData.primerNombre}
                                            onChange={handleChange}
                                            placeholder="Tu primer nombre"
                                            required
                                            maxLength={25}
                                            isInvalid={validated && error.includes('nombre')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            El primer nombre es requerido
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerSegundoNombre">
                                            Segundo Nombre
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerSegundoNombre"
                                            name="segundoNombre"
                                            value={formData.segundoNombre}
                                            onChange={handleChange}
                                            placeholder="Tu segundo nombre"
                                            maxLength={25}
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerPrimerApellido">
                                            Primer Apellido <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerPrimerApellido"
                                            name="primerApellido"
                                            value={formData.primerApellido}
                                            onChange={handleChange}
                                            placeholder="Tu primer apellido"
                                            required
                                            maxLength={25}
                                            isInvalid={validated && error.includes('apellido')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            El primer apellido es requerido
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerSegundoApellido">
                                            Segundo Apellido
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerSegundoApellido"
                                            name="segundoApellido"
                                            value={formData.segundoApellido}
                                            onChange={handleChange}
                                            placeholder="Tu segundo apellido"
                                            maxLength={25}
                                        />
                                    </Col>
                                </Row>

                                {/* Sección de contacto */}
                                <h5 className="mb-3 mt-4 border-bottom pb-2">
                                    <i className="bi bi-envelope me-2"></i>Información de Contacto
                                </h5>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerEmail">
                                            Correo electrónico <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            id="registerEmail"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Ej: tu@email.com"
                                            required
                                            isInvalid={validated && error.includes('correo')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Correo incorrecto
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerTelefono">
                                            Teléfono
                                        </Form.Label>
                                        <Form.Control
                                            type="tel"
                                            id="registerTelefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="Ej: +56912345678"
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerPassword">
                                            Contraseña <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                id="registerPassword"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Crea una contraseña"
                                                required
                                                minLength={4}
                                                maxLength={10}
                                                isInvalid={validated && error.includes('contraseña')}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={toggleShowPassword}
                                                disabled={loading}
                                            >
                                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                            </Button>
                                            <Form.Control.Feedback type="invalid">
                                                Contraseña muy corta
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                        <Form.Text className="text-muted">
                                            Mínimo 4 caracteres
                                        </Form.Text>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerConfirmPassword">
                                            Confirmar Contraseña <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="registerConfirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirma tu contraseña"
                                                required
                                                minLength={4}
                                                maxLength={10}
                                                isInvalid={validated && error.includes('coinciden')}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={toggleShowConfirmPassword}
                                                disabled={loading}
                                            >
                                                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                                            </Button>
                                            <Form.Control.Feedback type="invalid">
                                                Las contraseñas no coinciden
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerBirthdate">
                                            Fecha de Nacimiento <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            id="registerBirthdate"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            required
                                            isInvalid={validated && error.includes('18 años')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Debes ser mayor de 18 años
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>

                                {/* Sección de ubicación */}
                                <h5 className="mb-3 mt-4 border-bottom pb-2">
                                    <i className="bi bi-geo-alt me-2"></i>Ubicación (Opcional)
                                </h5>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerRegion">
                                            Región
                                        </Form.Label>
                                        <Form.Select
                                            id="registerRegion"
                                            name="region"
                                            value={formData.region}
                                            onChange={handleChange}
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
                                        <Form.Label htmlFor="registerComuna">
                                            Comuna
                                        </Form.Label>
                                        <Form.Select
                                            id="registerComuna"
                                            name="comuna"
                                            value={formData.comuna}
                                            onChange={handleChange}
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

                                {/* Dirección separada */}
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerNombreCalle">
                                            Nombre de Calle
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerNombreCalle"
                                            name="nombreCalle"
                                            value={formData.nombreCalle}
                                            onChange={handleChange}
                                            placeholder="Nombre de la calle, avenida, etc."
                                            maxLength={100}
                                        />
                                    </Col>

                                    <Col md={4} className="mb-3">
                                        <Form.Label htmlFor="registerNumeroCalle">
                                            Número
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerNumeroCalle"
                                            name="numeroCalle"
                                            value={formData.numeroCalle}
                                            onChange={handleChange}
                                            placeholder="Ej: 1340"
                                            maxLength={10}
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerTipoVivienda">
                                            Tipo de Vivienda
                                        </Form.Label>
                                        <Form.Select
                                            id="registerTipoVivienda"
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
                                        <Form.Label htmlFor="registerCodigoPostal">
                                            Código Postal
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerCodigoPostal"
                                            name="codigoPostal"
                                            value={formData.codigoPostal}
                                            onChange={handleChange}
                                            placeholder="Ej: 1234567"
                                            maxLength={7}
                                        />
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        id="registerTerms"
                                        name="terms"
                                        checked={formData.terms}
                                        onChange={handleChange}
                                        required
                                        isInvalid={validated && error.includes('términos')}
                                        label={
                                            <span>
                                                Acepto los <Link to="/terminos-y-condiciones">términos y condiciones</Link> y las{' '}
                                                <Link to="/privacidad-y-seguridad">políticas de privacidad y seguridad</Link>
                                            </span>
                                        }
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Debes aceptar los términos y condiciones
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 py-2"
                                    disabled={loading}
                                >
                                    <i className="bi bi-person-plus me-2"></i>
                                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <p className="mb-0">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link to="/login" className="text-decoration-none">
                                        Inicia sesión aquí
                                    </Link>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Registro;