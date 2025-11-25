import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Modal, Form, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CrudService } from '../../../services/crudService';
import { DashboardService } from '../../../services/dashboardService';
import { formatearCategoria } from '../../../utils/formatters';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estados para formularios
  const [productoForm, setProductoForm] = useState({ nombre: '', precio: '', stock: '', categoria: '' });
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', descripcion: '' });
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Función helper para obtener campos de producto
  const obtenerCampoProducto = (producto, campo) => {
    const mapaCampos = {
      nombre: ['nombre', 'name', 'title', 'productName', 'descripcion', 'description'],
      precio: ['precio', 'price', 'valor', 'cost', 'precioFinal', 'finalPrice'],
      stock: ['stock', 'cantidad', 'quantity', 'inventory', 'disponibles', 'available'],
      categoria: ['categoria', 'category', 'categoriaId', 'type', 'tipo'],
      descripcion: ['descripcion', 'description', 'desc', 'detalles'],
      destacado: ['destacado', 'featured', 'highlighted'],
      activo: ['activo', 'active', 'estado', 'status', 'enabled', 'available']
    };

    const camposPosibles = mapaCampos[campo] || [campo];
    for (const nombreCampo of camposPosibles) {
      if (producto[nombreCampo] !== undefined && producto[nombreCampo] !== null && producto[nombreCampo] !== '') {
        return producto[nombreCampo];
      }
    }

    const defaults = {
      nombre: 'Sin nombre',
      precio: 0,
      stock: 0,
      categoria: 'Sin categoría',
      descripcion: '',
      destacado: false,
      activo: true
    };

    return defaults[campo] || '';
  };

  // Función helper para obtener estado del producto
  const obtenerEstadoProducto = (producto) => {
    const activo = obtenerCampoProducto(producto, 'activo');

    if (typeof activo === 'boolean') return activo;
    if (typeof activo === 'string') {
      const inactiveKeywords = ['inactivo', 'disabled', 'false', '0', 'no', 'off', 'inactive'];
      return !inactiveKeywords.includes(activo.toLowerCase().trim());
    }
    if (typeof activo === 'number') return activo !== 0;

    return true;
  };

  // Handlers para CRUD
  const handleCreateProducto = async (e) => {
    e.preventDefault();
    try {
      const productoData = {
        nombre: productoForm.nombre.trim(),
        precio: Number(productoForm.precio),
        stock: Number(productoForm.stock),
        categoria: productoForm.categoria,
        descripcion: productoForm.descripcion?.trim() || '',
        destacado: productoForm.destacado || false,
        activo: productoForm.activo !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const productId = await CrudService.createProducto(productoData);

      if (productId) {
        console.log('✅ Producto creado exitosamente');
        setShowProductModal(false);
        setProductoForm({
          nombre: '',
          precio: '',
          stock: '',
          categoria: '',
          descripcion: '',
          destacado: false,
          activo: true
        });
        loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Error creando producto:', error);
    }
  };

  const handleUpdateProducto = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return;

    setActionLoading(true);
    try {
      const productoData = {
        nombre: productoForm.nombre.trim(),
        precio: Number(productoForm.precio),
        stock: Number(productoForm.stock),
        categoria: productoForm.categoria,
        descripcion: productoForm.descripcion?.trim() || '',
        destacado: productoForm.destacado || false,
        activo: productoForm.activo !== false,
        updatedAt: new Date()
      };

      const success = await CrudService.updateProducto(productoSeleccionado.id, productoData);
      if (success) {
        console.log('✅ Producto actualizado exitosamente');
        setShowProductModal(false);
        setProductoSeleccionado(null);
        setProductoForm({
          nombre: '',
          precio: '',
          stock: '',
          categoria: '',
          descripcion: '',
          destacado: false,
          activo: true
        });
        loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
    } finally {
      setActionLoading(false);
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

  // Funciones para las acciones de productos
  const manejarEditarProducto = (producto) => {
    console.log('📝 Editando producto:', producto);
    setProductoSeleccionado(producto);
    setProductoForm({
      nombre: obtenerCampoProducto(producto, 'nombre'),
      precio: obtenerCampoProducto(producto, 'precio'),
      stock: obtenerCampoProducto(producto, 'stock'),
      categoria: obtenerCampoProducto(producto, 'categoria'),
      descripcion: obtenerCampoProducto(producto, 'descripcion'),
      destacado: obtenerCampoProducto(producto, 'destacado') || false,
      activo: obtenerEstadoProducto(producto)
    });
    setShowProductModal(true);
  };

  const manejarEliminarProducto = (producto) => {
    console.log('🗑️ Eliminando producto:', producto);
    setProductoSeleccionado(producto);
    setShowDeleteModal(true);
  };

  const manejarVerDetalle = (producto) => {
    console.log('👀 Viendo detalles de producto:', producto);
    setProductoSeleccionado(producto);
    setShowDetailModal(true);
  };

  // Función para eliminar producto
  const confirmarEliminarProducto = async () => {
    if (!productoSeleccionado) return;

    setActionLoading(true);
    try {
      const success = await CrudService.deleteProducto(productoSeleccionado.id);
      if (success) {
        console.log('✅ Producto eliminado exitosamente');
        setShowDeleteModal(false);
        setProductoSeleccionado(null);
        loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
    } finally {
      setActionLoading(false);
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
          onShowModal={() => {
            setProductoSeleccionado(null);
            setShowProductModal(true);
          }}
          onEditar={manejarEditarProducto}
          onEliminar={manejarEliminarProducto}
          onVerDetalle={manejarVerDetalle}
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
    <Container fluid className="p-4 admin-dashboard" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <Row>
        <Col>
          <div>
            <h1 className="mb-1">Dashboard de Administración</h1>
            <p className="text-muted mb-0">
              Bienvenido, {currentUser?.name || 'Administrador'}
            </p>
          </div>
        </Col>
      </Row>
  
      <Row style={{ height: 'calc(100vh - 100px)' }}>
        {/* Sidebar de Navegación - SCROLL PROPIO */}
        <Col md={2} className="h-100">
          <Card className="h-100" style={{ overflowY: 'auto' }}>
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
                    Gestión de Usuarios
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeSection === 'productos'}
                    onClick={() => setActiveSection('productos')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Productos y Stock
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

              {/* Botones de acción debajo del menú */}
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
        <Col md={10} className="h-100">
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
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
        </div>
      </Col>
    </Row>

      {/* MODALES - Al final del return */}
      <ProductModal
        show={showProductModal}
        onHide={() => {
          setShowProductModal(false);
          setProductoSeleccionado(null);
        }}
        onSubmit={productoSeleccionado ? handleUpdateProducto : handleCreateProducto}
        formData={productoForm}
        onFormChange={setProductoForm}
        categorias={categorias}
        productoSeleccionado={productoSeleccionado}
        loading={actionLoading}
      />

      <DeleteModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setProductoSeleccionado(null);
        }}
        onConfirm={confirmarEliminarProducto}
        producto={productoSeleccionado}
        loading={actionLoading}
      />

      <DetailModal
        show={showDetailModal}
        onHide={() => {
          setShowDetailModal(false);
          setProductoSeleccionado(null);
        }}
        producto={productoSeleccionado}
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

// COMPONENTES DE SECCIÓN
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
            <Card.Header>
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

const ProductosSection = ({ productos, categorias, loading, onShowModal, onEditar, onEliminar, onVerDetalle }) => {

  // Función helper para obtener campos con fallbacks
  const getProductField = (producto, field) => {
    const fieldMap = {
      nombre: ['nombre', 'name', 'title', 'productName', 'descripcion', 'description'],
      precio: ['precio', 'price', 'valor', 'cost', 'precioFinal', 'finalPrice'],
      stock: ['stock', 'cantidad', 'quantity', 'inventory', 'disponibles', 'available'],
      categoria: ['categoria', 'category', 'categoriaId', 'type', 'tipo'],
      destacado: ['destacado', 'featured', 'highlighted', 'esDestacado'],
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
      destacado: false,
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

  // Función para obtener si el producto es destacado
  const getProductoDestacado = (producto) => {
    const destacado = getProductField(producto, 'destacado');

    if (typeof destacado === 'boolean') return destacado;
    if (typeof destacado === 'string') {
      const trueKeywords = ['true', 'yes', 'sí', 'si', '1', 'verdadero'];
      return trueKeywords.includes(destacado.toLowerCase().trim());
    }
    if (typeof destacado === 'number') return destacado !== 0;

    return false; // Por defecto no destacado
  };

  // Función para formatear precio con separadores de miles
  const formatPrecio = (precio) => {
    const precioNum = Number(precio);
    if (isNaN(precioNum)) return '$0';

    return `$${precioNum.toLocaleString('es-CL')}`;
  };

  // Función para formatear nombres de categoría (quitar underscores y capitalizar)
  const formatCategoria = (categoria) => {
    return formatearCategoria(categoria);
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
                <th>Destacado</th>
                <th>Estado</th>
                <th width="180">Acciones</th>
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
                    <Badge bg={getProductoDestacado(producto) ? 'warning' : 'secondary'}>
                      <i className={`bi bi-${getProductoDestacado(producto) ? 'star-fill' : 'star'} me-1`}></i>
                      {getProductoDestacado(producto) ? 'Sí' : 'No'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getEstadoProducto(producto) ? 'success' : 'secondary'}>
                      <i className={`bi bi-${getEstadoProducto(producto) ? 'check-circle' : 'x-circle'} me-1`}></i>
                      {getEstadoProducto(producto) ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-group-vertical btn-group-sm" role="group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        title="Editar producto"
                        onClick={() => onEditar && onEditar(producto)}
                        className="mb-1"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        title="Eliminar producto"
                        onClick={() => onEliminar && onEliminar(producto)}
                        className="mb-1"
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        title="Ver detalles"
                        onClick={() => onVerDetalle && onVerDetalle(producto)}
                      >
                        <i className="bi bi-eye"></i> Detalles
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

// COMPONENTES DE MODAL (FUERA del componente principal)
const ProductModal = ({ show, onHide, onSubmit, formData, onFormChange, categorias, productoSeleccionado, loading }) => {
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  // Función helper igual que en la tabla para consistencia
  const obtenerCampoCategoria = (categoria, campo) => {
    const mapaCampos = {
      nombre: ['nombre', 'name', 'title', 'categoriaName'],
      descripcion: ['descripcion', 'description', 'desc', 'detalles']
    };

    const camposPosibles = mapaCampos[campo] || [campo];
    for (const nombreCampo of camposPosibles) {
      if (categoria[nombreCampo] !== undefined && categoria[nombreCampo] !== null && categoria[nombreCampo] !== '') {
        return categoria[nombreCampo];
      }
    }

    return campo === 'nombre' ? 'Sin categoría' : '';
  };

  // Función para formatear nombres de categoría (igual que en la tabla)
  const formatearCategoria = (categoriaRaw) => {
    if (!categoriaRaw || categoriaRaw === 'Sin categoría') return 'Sin categoría';

    let categoria = categoriaRaw;

    // Si es un objeto categoría, extraer el nombre
    if (typeof categoria === 'object') {
      categoria = obtenerCampoCategoria(categoria, 'nombre');
    }

    // Reemplazar underscores y guiones con espacios
    let formateado = categoria.replace(/[_-]/g, ' ');

    // Capitalizar cada palabra
    formateado = formateado.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return formateado;
  };

  // Validación del formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es requerido';
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    const precio = Number(formData.precio);
    if (!formData.precio || isNaN(precio) || precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser un número mayor a 0';
    } else if (precio > 1000000) {
      nuevosErrores.precio = 'El precio no puede ser mayor a $1.000.000';
    }

    const stock = Number(formData.stock);
    if (!formData.stock || isNaN(stock) || stock < 0) {
      nuevosErrores.stock = 'El stock debe ser un número positivo';
    } else if (stock > 10000) {
      nuevosErrores.stock = 'El stock no puede ser mayor a 10.000 unidades';
    }

    if (!formData.categoria) {
      nuevosErrores.categoria = 'Selecciona una categoría';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambio de categoría
  const manejarCambioCategoria = (e) => {
    const valor = e.target.value;
    onFormChange({ ...formData, categoria: valor });
  };

  // Obtener categorías únicas y formateadas para el dropdown
  const obtenerOpcionesCategorias = () => {
    const categoriasUnicas = [];
    const vistas = new Set();

    categorias.forEach(cat => {
      const nombreRaw = obtenerCampoCategoria(cat, 'nombre');
      const nombreFormateado = formatearCategoria(nombreRaw);

      if (!vistas.has(nombreFormateado)) {
        vistas.add(nombreFormateado);
        categoriasUnicas.push({
          id: cat.id,
          nombreRaw: nombreRaw,
          nombreFormateado: nombreFormateado
        });
      }
    });

    return categoriasUnicas;
  };

  const opcionesCategorias = obtenerOpcionesCategorias();

  // Manejar envío del formulario
  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      await onSubmit(e);
    } catch (error) {
      console.error('Error en el modal:', error);
    } finally {
      setEnviando(false);
    }
  };

  // Resetear el modal cuando se cierra
  const manejarCerrar = () => {
    setErrores({});
    setEnviando(false);
    onHide();
  };

  // Formatear precio para vista previa (usando puntos como separadores de miles)
  const formatearPrecio = (precio) => {
    const precioNum = Number(precio);
    if (isNaN(precioNum)) return '$0';

    // Usar formato chileno con puntos para miles
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precioNum);
  };

  return (
    <Modal show={show} onHide={manejarCerrar} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi bi-${productoSeleccionado ? 'pencil' : 'plus-circle'} me-2`}></i>
          {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={manejarEnvio}>
        <Modal.Body>
          {/* Nombre del Producto */}
          <Form.Group className="mb-3">
            <Form.Label>
              Nombre del Producto <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Pan Integral Artesanal, Queque de Vainilla, etc."
              value={formData.nombre || ''}
              onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
              isInvalid={!!errores.nombre}
              disabled={enviando || loading}
            />
            <Form.Control.Feedback type="invalid">
              {errores.nombre}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Nombre descriptivo del producto (mín. 2 caracteres)
            </Form.Text>
          </Form.Group>

          <Row>
            {/* Precio */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Precio <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    min="0"
                    step="100"
                    value={formData.precio || ''}
                    onChange={(e) => onFormChange({ ...formData, precio: e.target.value })}
                    isInvalid={!!errores.precio}
                    disabled={enviando || loading}
                  />
                  <span className="input-group-text">CLP</span>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errores.precio}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Precio de venta al público ($1 - $1.000.000)
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Stock */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Stock Inicial <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  min="0"
                  max="10000"
                  value={formData.stock || ''}
                  onChange={(e) => onFormChange({ ...formData, stock: e.target.value })}
                  isInvalid={!!errores.stock}
                  disabled={enviando || loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.stock}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Cantidad disponible (0 - 10.000 unidades)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Categoría */}
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Categoría <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.categoria || ''}
                  onChange={manejarCambioCategoria}
                  isInvalid={!!errores.categoria}
                  disabled={enviando || loading}
                >
                  <option value="">Seleccionar categoría</option>
                  {opcionesCategorias.map(cat => (
                    <option key={cat.id} value={cat.nombreRaw}>
                      {cat.nombreFormateado}
                    </option>
                  ))}
                  <option disabled>──────────</option>
                  <option value="nueva_categoria">+ Crear nueva categoría</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errores.categoria}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {opcionesCategorias.length} categorías disponibles
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Descripción */}
          <Form.Group className="mb-3">
            <Form.Label>Descripción del Producto</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe las características, ingredientes, beneficios del producto..."
              value={formData.descripcion || ''}
              onChange={(e) => onFormChange({ ...formData, descripcion: e.target.value })}
              disabled={enviando || loading}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {(formData.descripcion?.length || 0)}/500 caracteres
            </Form.Text>
          </Form.Group>

          {/* Opciones adicionales */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Producto destacado"
                  checked={formData.destacado || false}
                  onChange={(e) => onFormChange({ ...formData, destacado: e.target.checked })}
                  disabled={enviando || loading}
                />
                <Form.Text className="text-muted">
                  Aparecerá en la sección de productos destacados
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Producto activo"
                  checked={formData.activo !== false}
                  onChange={(e) => onFormChange({ ...formData, activo: e.target.checked })}
                  disabled={enviando || loading}
                />
                <Form.Text className="text-muted">
                  Visible para los clientes
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Previsualización de datos */}
          {(formData.nombre || formData.precio || formData.categoria) && (
            <Card className="mt-3 border-info">
              <Card.Header className="bg-info text-white py-2">
                <small><i className="bi bi-eye me-1"></i>Vista previa - Como se verá en la tabla</small>
              </Card.Header>
              <Card.Body className="py-2">
                <Row className="align-items-center">
                  <Col md={4}>
                    <strong>Nombre:</strong>
                    <div className="fw-semibold">{formData.nombre || 'Sin nombre'}</div>
                  </Col>
                  <Col md={2}>
                    <strong>Precio:</strong>
                    <div className="text-success fw-bold">
                      {formatearPrecio(formData.precio)}
                    </div>
                  </Col>
                  <Col md={2}>
                    <strong>Stock:</strong>
                    <div>
                      <Badge bg={Number(formData.stock || 0) > 10 ? 'success' : Number(formData.stock || 0) > 0 ? 'warning' : 'danger'}>
                        {Number(formData.stock || 0).toLocaleString('es-CL')}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={4}>
                    <strong>Categoría:</strong>
                    <div>
                      <Badge bg="info" className="text-capitalize">
                        {formatearCategoria(formData.categoria)}
                      </Badge>
                    </div>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <strong>Estado:</strong>{' '}
                    <Badge bg={formData.active !== false ? 'success' : 'secondary'}>
                      <i className={`bi bi-${formData.active !== false ? 'check-circle' : 'x-circle'} me-1`}></i>
                      {formData.active !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {formData.destacado && (
                      <>
                        {' '}
                        <Badge bg="warning">
                          <i className="bi bi-star me-1"></i>
                          Destacado
                        </Badge>
                      </>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={manejarCerrar}
            disabled={enviando || loading}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={enviando || loading}
          >
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {productoSeleccionado ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${productoSeleccionado ? 'check-circle' : 'plus-circle'} me-1`}></i>
                {productoSeleccionado ? 'Guardar Cambios' : 'Crear Producto'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const DeleteModal = ({ show, onHide, onConfirm, producto, loading }) => {
  if (!producto) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <i className="bi bi-exclamation-triangle me-2"></i>
          Confirmar Eliminación
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <i className="bi bi-trash fs-1 text-danger"></i>
          <h5 className="mt-3">¿Estás seguro de eliminar este producto?</h5>
          <p className="fw-bold text-danger">{producto.nombre || producto.name || 'Producto sin nombre'}</p>
          <p className="text-muted">
            Esta acción no se puede deshacer. El producto será eliminado permanentemente.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Eliminando...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-1"></i>
              Sí, Eliminar
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const DetailModal = ({ show, onHide, producto }) => {
  if (!producto) return null;

  const formatearPrecio = (precio) => {
    const precioNum = Number(precio);
    if (isNaN(precioNum)) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precioNum);
  };

  const formatearCategoria = (categoriaRaw) => {
    if (!categoriaRaw || categoriaRaw === 'Sin categoría') return 'Sin categoría';
    let categoria = categoriaRaw;
    if (typeof categoria === 'object') {
      categoria = categoria.nombre || categoria.name || categoriaRaw;
    }
    let formateado = categoria.replace(/[_-]/g, ' ');
    formateado = formateado.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return formateado;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-info-circle me-2"></i>
          Detalles del Producto
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={8}>
            <h4 className="text-primary">{producto.nombre || producto.name || 'Sin nombre'}</h4>
            <p className="text-muted">{producto.descripcion || producto.description || 'Sin descripción'}</p>
          </Col>
          <Col md={4} className="text-end">
            <h3 className="text-success">{formatearPrecio(producto.precio || producto.price || 0)}</h3>
            <Badge bg={Number(producto.stock || producto.cantidad || 0) > 0 ? 'success' : 'danger'}>
              Stock: {Number(producto.stock || producto.cantidad || 0)}
            </Badge>
          </Col>
        </Row>

        <hr />

        <Row>
          <Col md={6}>
            <h6>Información General</h6>
            <table className="table table-sm">
              <tbody>
                <tr>
                  <td><strong>Categoría:</strong></td>
                  <td>
                    <Badge bg="info" className="text-capitalize">
                      {formatearCategoria(producto.categoria || producto.category || 'Sin categoría')}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>
                    <Badge bg={(producto.activo !== false && producto.active !== false) ? 'success' : 'secondary'}>
                      {(producto.activo !== false && producto.active !== false) ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Destacado:</strong></td>
                  <td>
                    {producto.destacado || producto.featured ? (
                      <Badge bg="warning">
                        <i className="bi bi-star me-1"></i>
                        Sí
                      </Badge>
                    ) : (
                      <span className="text-muted">No</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </Col>
          <Col md={6}>
            <h6>Información Adicional</h6>
            <table className="table table-sm">
              <tbody>
                <tr>
                  <td><strong>ID:</strong></td>
                  <td><code>{producto.id}</code></td>
                </tr>
                <tr>
                  <td><strong>Creado:</strong></td>
                  <td>
                    {producto.createdAt?.toDate?.()?.toLocaleDateString('es-CL') || 'No disponible'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Actualizado:</strong></td>
                  <td>
                    {producto.updatedAt?.toDate?.()?.toLocaleDateString('es-CL') || 'No disponible'}
                  </td>
                </tr>
              </tbody>
            </table>
          </Col>
        </Row>

        {producto.descripcion && (
          <>
            <hr />
            <h6>Descripción Completa</h6>
            <p className="text-muted">{producto.descripcion}</p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

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
            onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.descripcion}
            onChange={(e) => onFormChange({ ...formData, descripcion: e.target.value })}
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