import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CrudService } from '../../../services/crudService';
import { DashboardService } from '../../../services/dashboardService';

const ProfileAdmin = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Estados para formularios
  const [productoForm, setProductoForm] = useState({ nombre: '', precio: '', stock: '', categoria: '' });
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', descripcion: '' });

  // Cargar datos
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        estadisticas,
        ordenesData,
        productosData,
        usuariosData,
        categoriasData
      ] = await Promise.all([
        DashboardService.getEstadisticasCompletas(),
        CrudService.getOrdenes(),
        CrudService.getProductos(),
        CrudService.getUsuarios(),
        CrudService.getCategorias()
      ]);
      
      setStats(estadisticas);
      setOrdenes(ordenesData);
      setProductos(productosData);
      setUsuarios(usuariosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleBackToStore = () => {
    navigate('/');
  };

  // Handlers para CRUD
  const handleCreateProducto = async (e) => {
    e.preventDefault();
    try {
      await CrudService.createProducto(productoForm);
      setShowProductModal(false);
      setProductoForm({ nombre: '', precio: '', stock: '', categoria: '' });
      loadDashboardData(); // Recargar datos
    } catch (error) {
      console.error('Error creando producto:', error);
    }
  };

  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    try {
      await CrudService.createCategoria(categoriaForm);
      setShowCategoryModal(false);
      setCategoriaForm({ nombre: '', descripcion: '' });
      loadDashboardData();
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  const handleUpdateOrdenEstado = async (ordenId, nuevoEstado) => {
    try {
      await CrudService.updateOrdenEstado(ordenId, nuevoEstado);
      loadDashboardData();
    } catch (error) {
      console.error('Error actualizando orden:', error);
    }
  };

  // Renderizar sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection stats={stats} loading={loading} />;
      case 'usuarios':
        return <UsuariosSection usuarios={usuarios} loading={loading} />;
      case 'productos':
        return <ProductosSection 
          productos={productos} 
          categorias={categorias}
          loading={loading}
          onShowModal={() => setShowProductModal(true)}
        />;
      case 'categorias':
        return <CategoriasSection 
          categorias={categorias}
          loading={loading}
          onShowModal={() => setShowCategoryModal(true)}
        />;
      case 'ventas':
        return <VentasSection ordenes={ordenes} loading={loading} />;
      case 'pedidos':
        return <PedidosSection 
          ordenes={ordenes} 
          loading={loading}
          onUpdateEstado={handleUpdateOrdenEstado}
        />;
      default:
        return <DashboardSection stats={stats} loading={loading} />;
    }
  };

  return (
    <Container fluid className="p-4 admin-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div>
            <h1 className="mb-1">Dashboard de Administración</h1>
            <p className="text-muted mb-0">
              Bienvenido, {currentUser?.name || 'Administrador'}
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Sidebar de Navegación */}
        <Col md={2} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Menú Administrativo</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link 
                    active={activeSection === 'dashboard'} 
                    onClick={() => setActiveSection('dashboard')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeSection === 'usuarios'} 
                    onClick={() => setActiveSection('usuarios')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-people me-2"></i>
                    Usuarios
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeSection === 'productos'} 
                    onClick={() => setActiveSection('productos')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Productos
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeSection === 'categorias'} 
                    onClick={() => setActiveSection('categorias')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-tags me-2"></i>
                    Categorías
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeSection === 'ventas'} 
                    onClick={() => setActiveSection('ventas')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    Reportes de Ventas
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeSection === 'pedidos'} 
                    onClick={() => setActiveSection('pedidos')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-receipt me-2"></i>
                    Órdenes y Boletas
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="p-3 border-top">
                <Button 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                  onClick={handleBackToStore}
                >
                  <i className="bi bi-shop me-2"></i>
                  Volver a la Tienda
                </Button>
                <Button 
                  variant="outline-danger" 
                  className="w-100"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contenido Principal */}
        <Col md={10}>
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando datos...</p>
            </div>
          ) : (
            renderActiveSection()
          )}
        </Col>
      </Row>

      {/* Modales */}
      <ProductModal 
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        onSubmit={handleCreateProducto}
        formData={productoForm}
        onFormChange={setProductoForm}
        categorias={categorias}
      />

      <CategoryModal 
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        onSubmit={handleCreateCategoria}
        formData={categoriaForm}
        onFormChange={setCategoriaForm}
      />
    </Container>
  );
};

// Componentes para cada sección
const DashboardSection = ({ stats, loading }) => {
  if (!stats) return null;

  return (
    <>
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-people fs-1 text-primary"></i>
              <h3 className="mt-2">{stats.totalUsuarios}</h3>
              <p className="text-muted mb-0">Usuarios Registrados</p>
              <small className="text-success">+{stats.nuevosUsuariosMes} este mes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-cart-check fs-1 text-success"></i>
              <h3 className="mt-2">{stats.totalCompras}</h3>
              <p className="text-muted mb-0">Total Compras</p>
              <small className={stats.proyeccionCompras >= 0 ? "text-success" : "text-danger"}>
                {stats.proyeccionCompras >= 0 ? '+' : ''}{stats.proyeccionCompras}% vs mes anterior
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-box-seam fs-1 text-warning"></i>
              <h3 className="mt-2">{stats.totalProductos}</h3>
              <p className="text-muted mb-0">Productos Activos</p>
              <small className="text-muted">Inventario: {stats.inventarioTotal}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-currency-dollar fs-1 text-info"></i>
              <h3 className="mt-2">${stats.totalCompras * 25000}</h3>
              <p className="text-muted mb-0">Ventas Estimadas</p>
              <small className="text-muted">Promedio por orden</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Ventas de los Últimos 7 Días</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center p-5 bg-light rounded">
                <i className="bi bi-bar-chart fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Gráfico de ventas se cargará aquí</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Productos Más Vendidos</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center p-5 bg-light rounded">
                <i className="bi bi-trophy fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Top productos se cargará aquí</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const ProductosSection = ({ productos, categorias, loading, onShowModal }) => {
  
  // Función helper mejorada para obtener campos con fallbacks y valores por defecto
  const getProductField = (producto, field) => {
    const fieldMap = {
      nombre: ['nombre', 'name', 'title', 'productName', 'descripcion', 'description'],
      precio: ['precio', 'price', 'valor', 'cost', 'precioFinal', 'finalPrice'],
      stock: ['stock', 'cantidad', 'quantity', 'inventory', 'disponibles', 'available'],
      categoria: ['categoria', 'category', 'categoriaId', 'type', 'tipo'],
      activo: ['activo', 'active', 'estado', 'status', 'enabled', 'available']
    };
    
    const possibleFields = fieldMap[field] || [field];
    for (const fieldName of possibleFields) {
      if (producto[fieldName] !== undefined && producto[fieldName] !== null && producto[fieldName] !== '') {
        return producto[fieldName];
      }
    }
    
    // Valores por defecto más específicos
    const defaults = {
      nombre: 'Sin nombre',
      precio: 0,
      stock: 0,
      categoria: 'Sin categoría',
      activo: true
    };
    
    return defaults[field] || 'N/A';
  };

  const getEstadoProducto = (producto) => {
    const activo = getProductField(producto, 'activo');
    
    if (typeof activo === 'boolean') return activo;
    if (typeof activo === 'string') {
      const inactiveKeywords = ['inactivo', 'disabled', 'false', '0', 'no', 'off', 'inactive'];
      return !inactiveKeywords.includes(activo.toLowerCase().trim());
    }
    if (typeof activo === 'number') return activo !== 0;
    
    return true; // Por defecto activo
  };

  // Función para formatear precio con separadores de miles
  const formatPrecio = (precio) => {
    const precioNum = Number(precio);
    if (isNaN(precioNum)) return '$0';
    
    return `$${precioNum.toLocaleString('es-CL')}`;
  };

  // Función para formatear nombres de categoría (quitar underscores y capitalizar)
  const formatCategoria = (categoria) => {
    if (!categoria || categoria === 'Sin categoría') return 'Sin categoría';
    
    // Reemplazar underscores y guiones con espacios
    let formatted = categoria.replace(/[_-]/g, ' ');
    
    // Capitalizar cada palabra
    formatted = formatted.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    
    return formatted;
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Gestión de Productos ({productos.length})</h5>
        <Button variant="primary" onClick={onShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Producto
        </Button>
      </Card.Header>
      <Card.Body>
        {productos.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <p className="mt-3 text-muted">No hay productos registrados</p>
            <Button variant="primary" onClick={onShowModal}>
              Crear primer producto
            </Button>
          </div>
        ) : (
          <Table responsive striped hover>
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={producto.id || `product-${index}`}>
                  <td className="fw-semibold">
                    {getProductField(producto, 'nombre')}
                  </td>
                  <td className="text-success fw-bold">
                    {formatPrecio(getProductField(producto, 'precio'))}
                  </td>
                  <td>
                    <span className={
                      Number(getProductField(producto, 'stock')) > 10 
                        ? 'text-success' 
                        : Number(getProductField(producto, 'stock')) > 0 
                          ? 'text-warning' 
                          : 'text-danger'
                    }>
                      {Number(getProductField(producto, 'stock'))}
                    </span>
                  </td>
                  <td>
                    <Badge bg="info" className="text-capitalize">
                      {formatCategoria(getProductField(producto, 'categoria'))}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getEstadoProducto(producto) ? 'success' : 'secondary'}>
                      <i className={`bi bi-${getEstadoProducto(producto) ? 'check-circle' : 'x-circle'} me-1`}></i>
                      {getEstadoProducto(producto) ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        title="Editar producto"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        title="Eliminar producto"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

const CategoriasSection = ({ categorias, loading, onShowModal }) => {
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Gestión de Categorías</h5>
        <Button variant="primary" onClick={onShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Categoría
        </Button>
      </Card.Header>
      <Card.Body>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(categoria => (
              <tr key={categoria.id}>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion}</td>
                <td>
                  <Badge bg={categoria.activa ? 'success' : 'secondary'}>
                    {categoria.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-1">
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const PedidosSection = ({ ordenes, loading, onUpdateEstado }) => {
  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': 'warning',
      'confirmado': 'primary',
      'en_preparacion': 'info',
      'en_camino': 'warning',
      'entregado': 'success',
      'cancelado': 'danger'
    };
    return estados[estado] || 'secondary';
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Gestión de Órdenes</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(orden => (
              <tr key={orden.id}>
                <td>#{orden.id.slice(-6)}</td>
                <td>{orden.fecha?.toLocaleDateString?.() || 'N/A'}</td>
                <td>{orden.userId || 'Cliente'}</td>
                <td>${orden.total?.toLocaleString() || '0'}</td>
                <td>
                  <Badge bg={getEstadoBadge(orden.estado)}>
                    {orden.estado || 'pendiente'}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => onUpdateEstado(orden.id, 'confirmado')}
                  >
                    Confirmar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const UsuariosSection = ({ usuarios, loading }) => {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Gestión de Usuarios</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.phone}</td>
                <td>{usuario.createdAt?.toLocaleDateString?.() || 'N/A'}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-1">
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button variant="outline-info" size="sm">
                    <i className="bi bi-eye"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const VentasSection = ({ ordenes, loading }) => {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Reportes de Ventas</h5>
      </Card.Header>
      <Card.Body>
        <div className="text-center p-5 bg-light rounded">
          <i className="bi bi-graph-up fs-1 text-muted"></i>
          <p className="mt-3 text-muted">Reportes detallados de ventas se cargarán aquí</p>
        </div>
      </Card.Body>
    </Card>
  );
};

// Componentes de Modales
const ProductModal = ({ show, onHide, onSubmit, formData, onFormChange, categorias }) => (
  <Modal show={show} onHide={onHide} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Nuevo Producto</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Producto</Form.Label>
              <Form.Control
                type="text"
                value={formData.nombre}
                onChange={(e) => onFormChange({...formData, nombre: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                value={formData.precio}
                onChange={(e) => onFormChange({...formData, precio: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                value={formData.stock}
                onChange={(e) => onFormChange({...formData, stock: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={formData.categoria}
                onChange={(e) => onFormChange({...formData, categoria: e.target.value})}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.descripcion}
            onChange={(e) => onFormChange({...formData, descripcion: e.target.value})}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Crear Producto
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

const CategoryModal = ({ show, onHide, onSubmit, formData, onFormChange }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Nueva Categoría</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Nombre de la Categoría</Form.Label>
          <Form.Control
            type="text"
            value={formData.nombre}
            onChange={(e) => onFormChange({...formData, nombre: e.target.value})}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.descripcion}
            onChange={(e) => onFormChange({...formData, descripcion: e.target.value})}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Crear Categoría
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

export default ProfileAdmin;