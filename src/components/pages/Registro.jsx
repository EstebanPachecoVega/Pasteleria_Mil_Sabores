import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    validateRun,
    formatRun,
    getRunFormateado,
    isAdult,
    validatePassword,
    validateEmail,
    validatePhone,
    formatPhone,
    validateText
} from '../../utils/validations';

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

    const { register } = useAuth();
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

        // Formatear RUN mientras se escribe
        if (name === 'run') {
            newValue = formatRun(newValue);
        }

        setFormData({
            ...formData,
            [name]: newValue
        });

        // Formatear teléfono mientras se escribe
        if (name === 'telefono') {
            newValue = formatPhone(newValue);
        }

        // Validaciones en tiempo real
        if (validated) {
            const newErrors = { ...fieldErrors };

            switch (name) {
                case 'run':
                    if (!validateRun(newValue)) {
                        newErrors.run = 'RUN no válido. Verifica el número y dígito verificador';
                    } else {
                        delete newErrors.run;
                    }
                    break;

                case 'primerNombre':
                    const primerNombreError = validateText(newValue, 'Primer nombre');
                    if (primerNombreError) {
                        newErrors.primerNombre = primerNombreError;
                    } else {
                        delete newErrors.primerNombre;
                    }
                    break;

                case 'segundoNombre':
                    if (newValue) {
                        const segundoNombreError = validateText(newValue, 'Segundo nombre');
                        if (segundoNombreError) {
                            newErrors.segundoNombre = segundoNombreError;
                        } else {
                            delete newErrors.segundoNombre;
                        }
                    }
                    break;

                case 'primerApellido':
                    const primerApellidoError = validateText(newValue, 'Primer apellido');
                    if (primerApellidoError) {
                        newErrors.primerApellido = primerApellidoError;
                    } else {
                        delete newErrors.primerApellido;
                    }
                    break;

                case 'segundoApellido':
                    const segundoApellidoError = validateText(newValue, 'Segundo apellido');
                    if (segundoApellidoError) {
                        newErrors.segundoApellido = segundoApellidoError;
                    } else {
                        delete newErrors.segundoApellido;
                    }
                    break;

                case 'email':
                    const emailError = validateEmail(newValue);
                    if (emailError) {
                        newErrors.email = emailError;
                    } else {
                        delete newErrors.email;
                    }
                    break;

                case 'telefono':
                    if (newValue) {
                        const phoneError = validatePhone(newValue);
                        if (phoneError) {
                            newErrors.telefono = phoneError;
                        } else {
                            delete newErrors.telefono;
                        }
                    }
                    break;

                case 'password':
                    const passwordError = validatePassword(newValue);
                    if (passwordError) {
                        newErrors.password = passwordError;
                    } else {
                        delete newErrors.password;
                    }
                    // Si cambia la contraseña, validar también la confirmación
                    if (formData.confirmPassword && newValue !== formData.confirmPassword) {
                        newErrors.confirmPassword = 'Las contraseñas no coinciden';
                    } else if (formData.confirmPassword) {
                        delete newErrors.confirmPassword;
                    }
                    break;

                case 'confirmPassword':
                    if (newValue !== formData.password) {
                        newErrors.confirmPassword = 'Las contraseñas no coinciden';
                    } else {
                        delete newErrors.confirmPassword;
                    }
                    break;

                case 'birthDate':
                    if (newValue && !isAdult(newValue)) {
                        newErrors.birthDate = 'Debes ser mayor de 18 años';
                    } else {
                        delete newErrors.birthDate;
                    }
                    break;

                default:
                    break;
            }

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

        // Validaciones adicionales antes del envío
        const errors = {};

        // Validar RUN
        if (!validateRun(formData.run)) {
            errors.run = 'RUN no válido. Verifica el número y dígito verificador';
        }

        // Validar campos de nombre
        const primerNombreError = validateText(formData.primerNombre, 'Primer nombre');
        if (primerNombreError) errors.primerNombre = primerNombreError;

        const primerApellidoError = validateText(formData.primerApellido, 'Primer apellido');
        if (primerApellidoError) errors.primerApellido = primerApellidoError;

        const segundoApellidoError = validateText(formData.segundoApellido, 'Segundo apellido');
        if (segundoApellidoError) errors.segundoApellido = segundoApellidoError;

        // Validar email
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;

        // Validar teléfono
        if (formData.telefono) {
            const phoneError = validatePhone(formData.telefono);
            if (phoneError) errors.telefono = phoneError;
        }

        // Validar contraseña
        const passwordError = validatePassword(formData.password);
        if (passwordError) errors.password = passwordError;

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (formData.birthDate && !isAdult(formData.birthDate)) {
            errors.birthDate = 'Debes ser mayor de 18 años';
        }

        if (!formData.terms) {
            setError('Debes aceptar los términos y condiciones');
            setValidated(true);
            return;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setValidated(true);
            return;
        }

        setError('');
        setLoading(true);
        setValidated(true);

        try {
            // Construir el nombre completo con todos los componentes
            const nameParts = [
                formData.primerNombre,
                formData.segundoNombre,
                formData.primerApellido,
                formData.segundoApellido
            ].filter(Boolean);

            const fullName = nameParts.join(' ');

            // Construir dirección completa
            const direccionCompleta = `${formData.nombreCalle} ${formData.numeroCalle}${formData.tipoVivienda ? `, ${formData.tipoVivienda}` : ''
                }${formData.codigoPostal ? `, Código Postal: ${formData.codigoPostal}` : ''}`;

            // Obtener el RUN formateado para el backend
            const runFormateado = getRunFormateado(formData.run);

            // ✅ DATOS ACTUALIZADOS PARA FIREBASE
            const firebaseUserData = {
                // Datos principales
                run: runFormateado,
                name: fullName,
                rol: 'cliente',
                email: formData.email,
                password: formData.password,
                birthDate: formData.birthDate,

                // Nombres separados
                primerNombre: formData.primerNombre,
                segundoNombre: formData.segundoNombre,
                primerApellido: formData.primerApellido,
                segundoApellido: formData.segundoApellido,

                // Contacto y ubicación
                telefono: formData.telefono || '',
                discountCode: formData.discountCode || '',
                region: formData.region || '',
                comuna: formData.comuna || '',
                nombreCalle: formData.nombreCalle || '',
                numeroCalle: formData.numeroCalle || '',
                tipoVivienda: formData.tipoVivienda || '',
                codigoPostal: formData.codigoPostal || '',
                direccionCompleta: direccionCompleta,

                // Metadatos
                createdAt: new Date(),
            };

            // Datos para el AuthContext
            const authUserData = {
                name: fullName,
                primerNombre: formData.primerNombre,
                segundoNombre: formData.segundoNombre,
                primerApellido: formData.primerApellido,
                segundoApellido: formData.segundoApellido,
                email: formData.email,
                password: formData.password,
                birthDate: formData.birthDate,
                discountCode: formData.discountCode,
                run: runFormateado,
                telefono: formData.telefono,
                region: formData.region,
                comuna: formData.comuna,
                nombreCalle: formData.nombreCalle,
                numeroCalle: formData.numeroCalle,
                tipoVivienda: formData.tipoVivienda,
                codigoPostal: formData.codigoPostal,
                direccionCompleta: direccionCompleta
            };

            // Registrar en el AuthContext (que maneja Firebase)
            await register(authUserData);

            // Redirección según el tipo de usuario (ahora basado en rol)
            setTimeout(() => {
                navigate('/perfil');
            }, 1000);

        } catch (err) {
            console.error('Error en registro:', err);
            if (err.message.includes('email ya está registrado')) {
                setError('El email ya está registrado');
            } else if (err.message.includes('Firebase')) {
                setError('Error al guardar usuario en la base de datos');
            } else {
                setError(err.message);
            }
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
                                            isInvalid={validated && fieldErrors.run}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.run || 'Por favor ingresa un RUN válido'}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Ingresa tu RUN completo (8 dígitos + dígito verificador sin guión)
                                        </Form.Text>
                                        {formData.run && validateRun(formData.run) && (
                                            <div className="mt-2">
                                                <Form.Text className="text-success">
                                                    <strong>✓ RUN válido</strong>
                                                </Form.Text>
                                                <br />
                                                <Form.Text className="text-muted">
                                                    Se enviará como: {getRunFormateado(formData.run)}
                                                </Form.Text>
                                            </div>
                                        )}
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
                                            placeholder="Ej: FELICES50"
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
                                            isInvalid={validated && fieldErrors.primerNombre}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.primerNombre || 'El primer nombre es requerido'}
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
                                            isInvalid={validated && fieldErrors.segundoNombre}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.segundoNombre}
                                        </Form.Control.Feedback>
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
                                            isInvalid={validated && fieldErrors.primerApellido}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.primerApellido || 'El primer apellido es requerido'}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerSegundoApellido">
                                            Segundo Apellido <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerSegundoApellido"
                                            name="segundoApellido"
                                            value={formData.segundoApellido}
                                            onChange={handleChange}
                                            placeholder="Tu segundo apellido"
                                            required
                                            maxLength={25}
                                            isInvalid={validated && fieldErrors.segundoApellido}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.segundoApellido || 'El segundo apellido es requerido'}
                                        </Form.Control.Feedback>
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
                                            placeholder="Ej: tu@duoc.cl"
                                            required
                                            isInvalid={validated && fieldErrors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.email || 'Por favor ingresa un correo válido'}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Solo se permiten: @duoc.cl, @profesor.duoc.cl, @gmail.com
                                        </Form.Text>
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
                                            maxLength={15}
                                            isInvalid={validated && fieldErrors.telefono}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.telefono}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Ej: +56912345678 o 912345678 (máx. 15 caracteres)
                                        </Form.Text>
                                        {formData.telefono && (
                                            <div className="mt-1">
                                                <small className="text-muted">
                                                    Caracteres: {formData.telefono.length}/15
                                                </small>
                                            </div>
                                        )}
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
                                                isInvalid={validated && fieldErrors.password}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={toggleShowPassword}
                                                disabled={loading}
                                            >
                                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                            </Button>
                                            <Form.Control.Feedback type="invalid">
                                                {fieldErrors.password || 'La contraseña debe tener entre 4 y 10 caracteres'}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                        <Form.Text className="text-muted">
                                            4-10 caracteres, al menos una mayúscula, minúscula y número
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
                                                isInvalid={validated && fieldErrors.confirmPassword}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={toggleShowConfirmPassword}
                                                disabled={loading}
                                            >
                                                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                                            </Button>
                                            <Form.Control.Feedback type="invalid">
                                                {fieldErrors.confirmPassword || 'Las contraseñas deben coincidir'}
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
                                            isInvalid={validated && fieldErrors.birthDate}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.birthDate || 'Debes ser mayor de 18 años'}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>

                                {/* Sección de ubicación (Opcional) */}
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
                                    disabled={loading || Object.keys(fieldErrors).length > 0}
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