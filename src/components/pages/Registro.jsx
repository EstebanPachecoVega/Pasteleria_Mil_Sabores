import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

    // Función para calcular el dígito verificador esperado
    const calcularDigitoVerificador = (runBody) => {
        let factor = 2;
        let sum = 0;
        
        // Recorrer el cuerpo del RUN de derecha a izquierda
        for (let i = runBody.length - 1; i >= 0; i--) {
            sum += parseInt(runBody.charAt(i), 10) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }
        
        const expectedVerifier = 11 - (sum % 11);
        
        if (expectedVerifier === 11) {
            return '0';
        } else if (expectedVerifier === 10) {
            return 'K';
        } else {
            return expectedVerifier.toString();
        }
    };

    // Función para validar RUN chileno completo (con dígito verificador)
    const validateRun = (run) => {
        if (!run || run.trim() === '') return false;
        
        // Limpiar el RUN: eliminar espacios y convertir a mayúsculas
        const cleanRun = run.replace(/\s/g, '').toUpperCase();
        
        // Validar formato: 7-8 dígitos + 1 dígito verificador (0-9 o K)
        if (!/^\d{7,8}[0-9K]$/i.test(cleanRun)) {
            return false;
        }
        
        const runBody = cleanRun.slice(0, -1);
        const verifier = cleanRun.slice(-1).toUpperCase();
        
        const expectedVerifier = calcularDigitoVerificador(runBody);
        
        return expectedVerifier === verifier;
    };

    // Función para formatear RUN - permite números y K, sin guión
    const formatRun = (input) => {
        // Limpiar el input: eliminar todo excepto números y K, convertir a mayúsculas
        const cleanInput = input.replace(/[^\dkK]/gi, '').toUpperCase();
        
        if (cleanInput.length === 0) return '';
        
        // Limitar a 9 caracteres máximo (7-8 dígitos + 1 dígito verificador)
        const limitedInput = cleanInput.slice(0, 9);
        
        return limitedInput;
    };

    // Función para obtener el RUN con formato para el backend
    const getRunFormateado = (run) => {
        if (!validateRun(run)) return run;
        
        const cleanRun = run.replace(/\s/g, '').toUpperCase();
        const runBody = cleanRun.slice(0, -1);
        const verifier = cleanRun.slice(-1);
        
        return `${runBody}-${verifier}`;
    };

    // Función para validar si es mayor de edad
    const isAdult = (birthDate) => {
        if (!birthDate) return true;
        
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 18;
        }
        
        return age >= 18;
    };

    // Función para validar contraseña
    const validatePassword = (password) => {
        if (password.length < 4 || password.length > 10) {
            return 'La contraseña debe tener entre 4 y 10 caracteres';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'La contraseña debe contener al menos una minúscula';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'La contraseña debe contener al menos una mayúscula';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'La contraseña debe contener al menos un número';
        }
        return null;
    };

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
                    
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
                        newErrors.email = 'Email no válido';
                    } else {
                        delete newErrors.email;
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
        
        if (!validateRun(formData.run)) {
            errors.run = 'RUN no válido. Verifica el número y dígito verificador';
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email no válido';
        }
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            errors.password = passwordError;
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        if (formData.birthDate && !isAdult(formData.birthDate)) {
            errors.birthDate = 'Debes ser mayor de 18 años';
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

            await register({
                name: fullName,
                primerNombre: formData.primerNombre,
                segundoNombre: formData.segundoNombre,
                primerApellido: formData.primerApellido,
                segundoApellido: formData.segundoApellido,
                email: formData.email,
                password: formData.password,
                birthDate: formData.birthDate,
                discountCode: formData.discountCode,
                run: runFormateado, // Enviamos el RUN formateado con guión
                telefono: formData.telefono,
                region: formData.region,
                comuna: formData.comuna,
                nombreCalle: formData.nombreCalle,
                numeroCalle: formData.numeroCalle,
                tipoVivienda: formData.tipoVivienda,
                codigoPostal: formData.codigoPostal,
                direccionCompleta: direccionCompleta
            });
        } catch (err) {
            setError(err.message);
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
                            {error && <Alert variant="danger">{error}</Alert>}

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
                                        {formData.run && !validateRun(formData.run) && formData.run.length >= 8 && (
                                            <Form.Text className="text-warning">
                                                Verifica el dígito verificador
                                            </Form.Text>
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
                                            required
                                            maxLength={25}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            El segundo apellido es requerido
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
                                            placeholder="Ej: tu@email.com"
                                            required
                                            isInvalid={validated && fieldErrors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.email || 'Por favor ingresa un correo válido'}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerTelefono">
                                            Teléfono <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="tel"
                                            id="registerTelefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="Ej: +56912345678"
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Por favor ingresa un teléfono válido
                                        </Form.Control.Feedback>
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
                                            La contraseña debe tener 4-10 caracteres, al menos una mayúscula, una minúscula y un número
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
                                            Fecha de Nacimiento (opcional)
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            id="registerBirthdate"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            isInvalid={validated && fieldErrors.birthDate}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.birthDate}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            {formData.birthDate && !isAdult(formData.birthDate) && 
                                                'Debes ser mayor de 18 años para registrarte'
                                            }
                                        </Form.Text>
                                    </Col>
                                </Row>

                                {/* Sección de ubicación */}
                                <h5 className="mb-3 mt-4 border-bottom pb-2">
                                    <i className="bi bi-geo-alt me-2"></i>Ubicación
                                </h5>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerRegion">
                                            Región <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            id="registerRegion"
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
                                        <Form.Control.Feedback type="invalid">
                                            Por favor selecciona una región
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerComuna">
                                            Comuna <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            id="registerComuna"
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
                                        <Form.Control.Feedback type="invalid">
                                            Por favor selecciona una comuna
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>

                                {/* Dirección separada */}
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerNombreCalle">
                                            Nombre de Calle <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerNombreCalle"
                                            name="nombreCalle"
                                            value={formData.nombreCalle}
                                            onChange={handleChange}
                                            placeholder="Nombre de la calle, avenida, etc."
                                            required
                                            maxLength={100}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            El nombre de calle es requerido
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={4} className="mb-3">
                                        <Form.Label htmlFor="registerNumeroCalle">
                                            Número <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="registerNumeroCalle"
                                            name="numeroCalle"
                                            value={formData.numeroCalle}
                                            onChange={handleChange}
                                            placeholder="Ej: 1340"
                                            required
                                            maxLength={10}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            El número es requerido
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label htmlFor="registerTipoVivienda">
                                            Tipo de Vivienda (opcional)
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
                                            Código Postal (opcional)
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