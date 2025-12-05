import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Modal, Form, Table, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CrudService } from '../../../services/crudService';
import { DashboardService } from '../../../services/dashboardService';
import { formatearCategoria } from '../../../utils/formatters';

const ProfileAdmin = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [estadisticas, setEstadisticas] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarModalEditarCategoria, setMostrarModalEditarCategoria] = useState(false);
  const [mostrarModalEliminarCategoria, setMostrarModalEliminarCategoria] = useState(false);

  const [formularioProducto, setFormularioProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: '',
    destacado: false,
    activo: true
  });

  const [formularioCategoria, setFormularioCategoria] = useState({
    nombre: '',
    descripcion: '',
    orden: ''
  });

  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [erroresFormulario, setErroresFormulario] = useState({});

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setCargando(true);
    try {
      const [
        estadisticasData,
        ordenesData,
        productosData,
        usuariosData,
        categoriasData
      ] = await Promise.all([
        DashboardService.obtenerEstadisticasCompletas(),
        CrudService.obtenerOrdenes(),
        CrudService.obtenerProductos(),
        CrudService.obtenerUsuarios(),
        CrudService.obtenerCategorias()
      ]);

      setEstadisticas(estadisticasData);
      setOrdenes(ordenesData);
      setProductos(productosData);
      setUsuarios(usuariosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setCargando(false);
  };

  const manejarCerrarSesion = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const manejarVolverTienda = () => {
    navigate('/');
  };

  const obtenerCampoProducto = (producto, campo) => {
    const mapaCampos = {
      nombre: ['nombre', 'name', 'title'],
      precio: ['precio', 'price', 'valor'],
      stock: ['stock', 'cantidad', 'quantity'],
      categoriaId: ['categoriaId', 'categoria', 'category'],
      descripcion: ['descripcion', 'description'],
      destacado: ['destacado', 'featured'],
      activo: ['activo', 'active', 'estado']
    };

    const camposPosibles = mapaCampos[campo] || [campo];
    for (const nombreCampo of camposPosibles) {
      if (producto[nombreCampo] !== undefined && producto[nombreCampo] !== null) {
        return producto[nombreCampo];
      }
    }

    const valoresPorDefecto = {
      nombre: 'Sin nombre',
      precio: 0,
      stock: 0,
      categoriaId: '',
      descripcion: '',
      destacado: false,
      activo: true
    };

    return valoresPorDefecto[campo] || '';
  };

  const obtenerEstadoProducto = (producto) => {
    const activo = obtenerCampoProducto(producto, 'activo');
    return activo !== false && activo !== 'false' && activo !== 0;
  };

  const validarFormularioProducto = () => {
    const errores = {};

    if (!formularioProducto.nombre?.trim()) {
      errores.nombre = 'El nombre del producto es requerido';
    }

    const precio = Number(formularioProducto.precio);
    if (!formularioProducto.precio || isNaN(precio) || precio <= 0) {
      errores.precio = 'El precio debe ser mayor a 0';
    }

    const stock = Number(formularioProducto.stock);
    if (stock < 0) {
      errores.stock = 'El stock no puede ser negativo';
    }

    if (!formularioProducto.categoriaId) {
      errores.categoriaId = 'Selecciona una categoría';
    }

    setErroresFormulario(errores);
    return Object.keys(errores).length === 0;
  };

  // Manejo de creación y actualización de productos

  const manejarCrearProducto = async (e) => {
    e.preventDefault();

    if (!validarFormularioProducto()) return;

    setCargandoAccion(true);
    try {
      const datosProducto = {
        nombre: formularioProducto.nombre.trim(),
        descripcion: formularioProducto.descripcion?.trim() || '',
        precio: Number(formularioProducto.precio),
        stock: Number(formularioProducto.stock),
        categoriaId: formularioProducto.categoriaId,
        destacado: formularioProducto.destacado || false,
        activo: formularioProducto.activo !== false
      };

      const productoId = await CrudService.crearProducto(datosProducto);

      if (productoId) {
        setMostrarModalProducto(false);
        resetearFormularioProducto();
        cargarDatosDashboard();
      }
    } catch (error) {
      console.error('Error creando producto:', error);
      setErroresFormulario({ submit: 'Error al crear el producto' });
    } finally {
      setCargandoAccion(false);
    }
  };

  const manejarActualizarProducto = async (e) => {
    e.preventDefault();

    if (!productoSeleccionado || !validarFormularioProducto()) return;

    setCargandoAccion(true);
    try {
      const datosActualizados = {
        nombre: formularioProducto.nombre.trim(),
        descripcion: formularioProducto.descripcion?.trim() || '',
        precio: Number(formularioProducto.precio),
        stock: Number(formularioProducto.stock),
        categoriaId: formularioProducto.categoriaId,
        destacado: formularioProducto.destacado || false,
        activo: formularioProducto.activo !== false
      };

      const exito = await CrudService.actualizarProducto(productoSeleccionado.id, datosActualizados);

      if (exito) {
        setMostrarModalProducto(false);
        resetearFormularioProducto();
        cargarDatosDashboard();
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      setErroresFormulario({ submit: 'Error al actualizar el producto' });
    } finally {
      setCargandoAccion(false);
    }
  };

  const manejarCrearCategoria = async (e) => {
    e.preventDefault();

    if (!formularioCategoria.nombre?.trim()) {
      alert('❌ El nombre de la categoría es requerido');
      return;
    }

    setCargandoAccion(true);
    try {
      const datosCategoria = {
        nombre: formularioCategoria.nombre.trim(),
        descripcion: formularioCategoria.descripcion?.trim() || '',
        orden: Number(formularioCategoria.orden) || 0
      };

      const categoriaId = await CrudService.crearCategoria(datosCategoria);

      if (categoriaId) {
        setMostrarModalCategoria(false);
        resetearFormularioCategoria();
        cargarDatosDashboard();

        alert(`✅ Categoría creada exitosamente\nID: ${categoriaId}\nSlug: ${categoriaId.replace('cat_', '').replace('_', '-')}`);
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
      alert(`❌ Error creando categoría: ${error.message || 'Error desconocido'}`);
    } finally {
      setCargandoAccion(false);
    }
  };

  const manejarEditarCategoria = async (e) => {
    e.preventDefault();

    if (!categoriaSeleccionada) return;

    setCargandoAccion(true);
    try {
      const datosActualizados = {
        nombre: formularioCategoria.nombre.trim(),
        descripcion: formularioCategoria.descripcion?.trim() || '',
        orden: Number(formularioCategoria.orden) || 0,
        slug: formularioCategoria.nombre.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      };

      const exito = await CrudService.actualizarCategoria(
        categoriaSeleccionada.id,
        datosActualizados
      );

      if (exito) {
        setMostrarModalEditarCategoria(false);
        setCategoriaSeleccionada(null);
        resetearFormularioCategoria();
        cargarDatosDashboard();
        alert('✅ Categoría actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      alert('❌ Error actualizando categoría');
    } finally {
      setCargandoAccion(false);
    }
  };

  const manejarEliminarCategoria = async () => {
    if (!categoriaSeleccionada) return;

    setCargandoAccion(true);
    try {
      // Primero verificar si hay productos usando esta categoría
      const productos = await CrudService.obtenerProductosPorCategoriaId(categoriaSeleccionada.id);

      if (productos.length > 0) {
        alert(`⚠️ No se puede eliminar la categoría "${categoriaSeleccionada.nombre}"\n\nTiene ${productos.length} productos asociados.`);
        setCargandoAccion(false);
        return;
      }

      // Preguntar al usuario qué tipo de eliminación quiere
      const confirmacion = window.confirm(
        `¿Cómo quieres eliminar la categoría "${categoriaSeleccionada.nombre}"?\n\n` +
        `✅ Ocultar (marcar como inactiva):\n` +
        `   • Se puede reactivar después\n` +
        `   • Recomendado\n\n` +
        `🗑️ Eliminar permanentemente:\n` +
        `   • NO se puede recuperar\n` +
        `   • Solo si estás seguro`
      );

      let exito = false;

      if (confirmacion) {
        // Eliminación permanente
        exito = await CrudService.eliminarCategoriaPermanente(categoriaSeleccionada.id);
        if (exito) {
          alert(`🗑️ Categoría eliminada permanentemente`);
        }
      } else {
        // Soft delete (marcar como inactiva)
        exito = await CrudService.eliminarCategoria(categoriaSeleccionada.id);
        if (exito) {
          alert(`👁️ Categoría marcada como inactiva`);
        }
      }

      if (exito) {
        setMostrarModalEliminarCategoria(false);
        setCategoriaSeleccionada(null);
        cargarDatosDashboard();
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('❌ Error eliminando categoría');
    } finally {
      setCargandoAccion(false);
    }
  };

  const manejarActualizarEstadoOrden = async (ordenId, nuevoEstado) => {
    try {
      await CrudService.actualizarEstadoOrden(ordenId, nuevoEstado);
      cargarDatosDashboard();
    } catch (error) {
      console.error('Error actualizando orden:', error);
    }
  };

  const manejarEliminarProducto = async () => {
    if (!productoSeleccionado) return;

    setCargandoAccion(true);
    try {
      const exito = await CrudService.eliminarProducto(productoSeleccionado.id);

      if (exito) {
        setMostrarModalEliminar(false);
        setProductoSeleccionado(null);
        cargarDatosDashboard();
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setFormularioProducto({
      nombre: obtenerCampoProducto(producto, 'nombre'),
      descripcion: obtenerCampoProducto(producto, 'descripcion'),
      precio: obtenerCampoProducto(producto, 'precio'),
      stock: obtenerCampoProducto(producto, 'stock'),
      categoriaId: obtenerCampoProducto(producto, 'categoriaId'),
      destacado: obtenerCampoProducto(producto, 'destacado') || false,
      activo: obtenerEstadoProducto(producto)
    });
    setMostrarModalProducto(true);
    setErroresFormulario({});
  };

  const abrirModalNuevoProducto = () => {
    setProductoSeleccionado(null);
    resetearFormularioProducto();
    setMostrarModalProducto(true);
    setErroresFormulario({});
  };

  const abrirModalEditarCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setFormularioCategoria({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      orden: categoria.orden || 0
    });
    setMostrarModalEditarCategoria(true);
  };

  const abrirModalEliminarCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarModalEliminarCategoria(true);
  };

  const resetearFormularioProducto = () => {
    setFormularioProducto({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoriaId: '',
      destacado: false,
      activo: true
    });
  };

  const resetearFormularioCategoria = () => {
    setFormularioCategoria({
      nombre: '',
      descripcion: '',
      orden: ''
    });
  };

  const renderizarSeccionActiva = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return <SeccionDashboard estadisticas={estadisticas} />;
      case 'usuarios':
        return <SeccionUsuarios usuarios={usuarios} />;
      case 'productos':
        return (
          <SeccionProductos
            productos={productos}
            categorias={categorias}
            onNuevoProducto={abrirModalNuevoProducto}
            onEditarProducto={abrirModalEditarProducto}
            onEliminarProducto={(producto) => {
              setProductoSeleccionado(producto);
              setMostrarModalEliminar(true);
            }}
            onVerDetalle={(producto) => {
              setProductoSeleccionado(producto);
              setMostrarModalDetalle(true);
            }}
          />
        );
      case 'categorias':
        return (
          <SeccionCategorias
            categorias={categorias}
            onNuevaCategoria={() => setMostrarModalCategoria(true)}
            onEditarCategoria={abrirModalEditarCategoria}
            onEliminarCategoria={abrirModalEliminarCategoria}
          />
        );
      case 'ventas':
        return <SeccionVentas ordenes={ordenes} />;
      case 'pedidos':
        return (
          <SeccionPedidos
            ordenes={ordenes}
            onActualizarEstado={manejarActualizarEstadoOrden}
          />
        );
      default:
        return <SeccionDashboard estadisticas={estadisticas} />;
    }
  };

  return (
    <Container fluid className="p-4 admin-dashboard" style={{ height: '100vh', overflow: 'hidden' }}>
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
        <Col md={2} className="h-100">
          <Card className="h-100" style={{ overflowY: 'auto' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Menú Administrativo</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link
                    active={seccionActiva === 'dashboard'}
                    onClick={() => setSeccionActiva('dashboard')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={seccionActiva === 'usuarios'}
                    onClick={() => setSeccionActiva('usuarios')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-people me-2"></i>
                    Usuarios
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={seccionActiva === 'productos'}
                    onClick={() => setSeccionActiva('productos')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Productos
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={seccionActiva === 'categorias'}
                    onClick={() => setSeccionActiva('categorias')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-tags me-2"></i>
                    Categorías
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={seccionActiva === 'ventas'}
                    onClick={() => setSeccionActiva('ventas')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    Ventas
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={seccionActiva === 'pedidos'}
                    onClick={() => setSeccionActiva('pedidos')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-receipt me-2"></i>
                    Pedidos
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <div className="p-3 border-top">
                <Button
                  variant="outline-primary"
                  className="w-100 mb-2"
                  onClick={manejarVolverTienda}
                >
                  <i className="bi bi-shop me-2"></i>
                  Volver a la Tienda
                </Button>
                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={manejarCerrarSesion}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={10} className="h-100">
          <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
            {cargando ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando datos...</p>
              </div>
            ) : (
              renderizarSeccionActiva()
            )}
          </div>
        </Col>
      </Row>

      <ModalProducto
        show={mostrarModalProducto}
        onHide={() => setMostrarModalProducto(false)}
        onSubmit={productoSeleccionado ? manejarActualizarProducto : manejarCrearProducto}
        formulario={formularioProducto}
        onChangeFormulario={setFormularioProducto}
        categorias={categorias}
        productoSeleccionado={productoSeleccionado}
        cargando={cargandoAccion}
        errores={erroresFormulario}
      />

      <ModalEliminarProducto
        show={mostrarModalEliminar}
        onHide={() => setMostrarModalEliminar(false)}
        onConfirmar={manejarEliminarProducto}
        producto={productoSeleccionado}
        cargando={cargandoAccion}
      />

      <ModalDetalleProducto
        show={mostrarModalDetalle}
        onHide={() => setMostrarModalDetalle(false)}
        producto={productoSeleccionado}
      />

      <ModalCategoria
        show={mostrarModalCategoria}
        onHide={() => setMostrarModalCategoria(false)}
        onSubmit={manejarCrearCategoria}
        formulario={formularioCategoria}
        onChangeFormulario={setFormularioCategoria}
      />

      <ModalEditarCategoria
        show={mostrarModalEditarCategoria}
        onHide={() => {
          setMostrarModalEditarCategoria(false);
          setCategoriaSeleccionada(null);
          resetearFormularioCategoria();
        }}
        onSubmit={manejarEditarCategoria}
        formulario={formularioCategoria}
        onChangeFormulario={setFormularioCategoria}
        categoria={categoriaSeleccionada}
        cargando={cargandoAccion}
      />

      <ModalEliminarCategoria
        show={mostrarModalEliminarCategoria}
        onHide={() => {
          setMostrarModalEliminarCategoria(false);
          setCategoriaSeleccionada(null);
        }}
        onConfirmar={manejarEliminarCategoria}
        categoria={categoriaSeleccionada}
        cargando={cargandoAccion}
      />
    </Container>
  );
};

const SeccionDashboard = ({ estadisticas }) => {
  if (!estadisticas) return null;

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <>
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-people fs-1 text-primary"></i>
              <h3 className="mt-2">{estadisticas.totalUsuarios}</h3>
              <p className="text-muted mb-0">Usuarios</p>
              <small className="text-success">
                +{estadisticas.nuevosUsuariosMes} este mes
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-cart-check fs-1 text-success"></i>
              <h3 className="mt-2">{estadisticas.totalCompras}</h3>
              <p className="text-muted mb-0">Compras</p>
              <small className={estadisticas.proyeccionCompras >= 0 ? "text-success" : "text-danger"}>
                {estadisticas.proyeccionCompras >= 0 ? '+' : ''}{estadisticas.proyeccionCompras}%
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-box-seam fs-1 text-warning"></i>
              <h3 className="mt-2">{estadisticas.totalProductos}</h3>
              <p className="text-muted mb-0">Productos</p>
              <small className="text-muted">
                Stock: {estadisticas.inventarioTotal}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-currency-dollar fs-1 text-info"></i>
              <h3 className="mt-2">{formatearMoneda(estadisticas.ventasTotales)}</h3>
              <p className="text-muted mb-0">Ventas Totales</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Ventas Recientes</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center p-5 bg-light rounded">
                <i className="bi bi-bar-chart fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Gráfico de ventas</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Estadísticas</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless>
                <tbody>
                  <tr>
                    <td><strong>Usuarios Nuevos:</strong></td>
                    <td className="text-end">{estadisticas.nuevosUsuariosMes}</td>
                  </tr>
                  <tr>
                    <td><strong>Crecimiento:</strong></td>
                    <td className={`text-end ${estadisticas.proyeccionCompras >= 0 ? "text-success" : "text-danger"}`}>
                      {estadisticas.proyeccionCompras >= 0 ? '+' : ''}{estadisticas.proyeccionCompras}%
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Stock Total:</strong></td>
                    <td className="text-end">{estadisticas.inventarioTotal}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const SeccionProductos = ({ productos, categorias, onNuevoProducto, onEditarProducto, onEliminarProducto, onVerDetalle }) => {
  const obtenerNombreCategoria = (categoriaId) => {
    if (!categoriaId) return 'Sin categoría';
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : categoriaId;
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Productos ({productos.length})</h5>
        <Button variant="primary" onClick={onNuevoProducto}>
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Producto
        </Button>
      </Card.Header>
      <Card.Body>
        {productos.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <p className="mt-3 text-muted">No hay productos registrados</p>
            <Button variant="primary" onClick={onNuevoProducto}>
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
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="fw-semibold">
                    {producto.nombre || 'Sin nombre'}
                  </td>
                  <td className="text-success fw-bold">
                    {formatearPrecio(producto.precio)}
                  </td>
                  <td>
                    <Badge bg={
                      (producto.stock || 0) > 10 ? 'success' :
                        (producto.stock || 0) > 0 ? 'warning' : 'danger'
                    }>
                      {producto.stock || 0}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="info">
                      {formatearCategoria(obtenerNombreCategoria(producto.categoriaId))}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={producto.activo !== false ? 'success' : 'secondary'}>
                      {producto.activo !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-group-vertical btn-group-sm" role="group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEditarProducto(producto)}
                        className="mb-1"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onEliminarProducto(producto)}
                        className="mb-1"
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => onVerDetalle(producto)}
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

const SeccionCategorias = ({ categorias, onNuevaCategoria, onEditarCategoria, onEliminarCategoria }) => {
  // Ordenar categorías por orden numérico
  const categoriasOrdenadas = [...categorias].sort((a, b) => {
    return (a.orden || 0) - (b.orden || 0);
  });

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Categorías ({categorias.length})</h5>
        <Button variant="primary" onClick={onNuevaCategoria}>
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Categoría
        </Button>
      </Card.Header>
      <Card.Body>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasOrdenadas.map(categoria => (
              <tr key={categoria.id}>
                <td className="fw-bold">{categoria.orden || 0}</td>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion || '-'}</td>
                <td>
                  <Badge bg={categoria.activa !== false ? 'success' : 'secondary'}>
                    {categoria.activa !== false ? 'Activa' : 'Inactiva'}
                  </Badge>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      title="Editar categoría"
                      onClick={() => onEditarCategoria(categoria)}
                      className="me-1"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Eliminar categoría"
                      onClick={() => onEliminarCategoria(categoria)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const SeccionPedidos = ({ ordenes, onActualizarEstado }) => {
  const obtenerColorEstado = (estado) => {
    const colores = {
      'pendiente': 'warning',
      'confirmado': 'primary',
      'en_preparacion': 'info',
      'en_camino': 'warning',
      'entregado': 'success',
      'cancelado': 'danger'
    };
    return colores[estado] || 'secondary';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    if (typeof fecha.toDate === 'function') {
      return fecha.toDate().toLocaleDateString('es-CL');
    }
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString('es-CL');
    }
    return fecha;
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Pedidos ({ordenes.length})</h5>
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
                <td>#{orden.id?.slice(-6) || orden.id}</td>
                <td>{formatearFecha(orden.createdAt || orden.fecha)}</td>
                <td>{orden.userId || orden.cliente || 'Cliente'}</td>
                <td>${(orden.total || 0).toLocaleString('es-CL')}</td>
                <td>
                  <Badge bg={obtenerColorEstado(orden.estado)}>
                    {orden.estado || 'pendiente'}
                  </Badge>
                </td>
                <td>
                  {orden.estado === 'pendiente' && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => onActualizarEstado(orden.id, 'confirmado')}
                    >
                      Confirmar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const SeccionUsuarios = ({ usuarios }) => {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Usuarios ({usuarios.length})</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.phone || 'N/A'}</td>
                <td>
                  {usuario.createdAt?.toDate?.()?.toLocaleDateString('es-CL') || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const SeccionVentas = ({ ordenes }) => {
  const calcularTotalVentas = () => {
    return ordenes.reduce((total, orden) => total + (orden.total || 0), 0);
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Reportes de Ventas</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  ${calcularTotalVentas().toLocaleString('es-CL')}
                </h3>
                <p className="text-muted mb-0">Ventas Totales</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3>{ordenes.length}</h3>
                <p className="text-muted mb-0">Pedidos Totales</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3>
                  ${(calcularTotalVentas() / (ordenes.length || 1)).toLocaleString('es-CL')}
                </h3>
                <p className="text-muted mb-0">Promedio por Pedido</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const ModalProducto = ({ show, onHide, onSubmit, formulario, onChangeFormulario, categorias, productoSeleccionado, cargando, errores }) => {
  const manejarEnvio = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi bi-${productoSeleccionado ? 'pencil' : 'plus-circle'} me-2`}></i>
          {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={manejarEnvio}>
        <Modal.Body>
          {errores.submit && (
            <Alert variant="danger">
              {errores.submit}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto *</Form.Label>
            <Form.Control
              type="text"
              value={formulario.nombre}
              onChange={(e) => onChangeFormulario({ ...formulario, nombre: e.target.value })}
              isInvalid={!!errores.nombre}
              disabled={cargando}
            />
            <Form.Control.Feedback type="invalid">
              {errores.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="number"
                  value={formulario.precio}
                  onChange={(e) => onChangeFormulario({ ...formulario, precio: e.target.value })}
                  isInvalid={!!errores.precio}
                  disabled={cargando}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.precio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={formulario.stock}
                  onChange={(e) => onChangeFormulario({ ...formulario, stock: e.target.value })}
                  isInvalid={!!errores.stock}
                  disabled={cargando}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.stock}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Categoría *</Form.Label>
            <Form.Select
              value={formulario.categoriaId}
              onChange={(e) => onChangeFormulario({ ...formulario, categoriaId: e.target.value })}
              isInvalid={!!errores.categoriaId}
              disabled={cargando}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errores.categoriaId}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formulario.descripcion}
              onChange={(e) => onChangeFormulario({ ...formulario, descripcion: e.target.value })}
              disabled={cargando}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Producto destacado"
                checked={formulario.destacado}
                onChange={(e) => onChangeFormulario({ ...formulario, destacado: e.target.checked })}
                disabled={cargando}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Producto activo"
                checked={formulario.activo}
                onChange={(e) => onChangeFormulario({ ...formulario, activo: e.target.checked })}
                disabled={cargando}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={cargando}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={cargando}>
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {productoSeleccionado ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${productoSeleccionado ? 'check-circle' : 'plus-circle'} me-1`}></i>
                {productoSeleccionado ? 'Guardar' : 'Crear'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const ModalEliminarProducto = ({ show, onHide, onConfirmar, producto, cargando }) => {
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
          <p className="fw-bold">{producto.nombre || 'Producto sin nombre'}</p>
          <p className="text-muted">
            Esta acción marcará el producto como inactivo.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={cargando}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar} disabled={cargando}>
          {cargando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Eliminando...
            </>
          ) : (
            'Sí, Eliminar'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ModalDetalleProducto = ({ show, onHide, producto }) => {
  if (!producto) return null;

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    if (typeof fecha.toDate === 'function') {
      return fecha.toDate().toLocaleString('es-CL');
    }
    return fecha;
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
            <h4>{producto.nombre || 'Sin nombre'}</h4>
            <p className="text-muted">{producto.descripcion || 'Sin descripción'}</p>
          </Col>
          <Col md={4} className="text-end">
            <h3 className="text-success">{formatearPrecio(producto.precio)}</h3>
            <Badge bg={(producto.stock || 0) > 0 ? 'success' : 'danger'}>
              Stock: {producto.stock || 0}
            </Badge>
          </Col>
        </Row>

        <hr />

        <Row>
          <Col md={6}>
            <h6>Información General</h6>
            <Table size="sm">
              <tbody>
                <tr>
                  <td><strong>Categoría:</strong></td>
                  <td>{formatearCategoria(producto.categoria || producto.categoriaId || 'Sin categoría')}</td>
                </tr>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>
                    <Badge bg={producto.activo !== false ? 'success' : 'secondary'}>
                      {producto.activo !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Destacado:</strong></td>
                  <td>
                    {producto.destacado ? (
                      <Badge bg="warning">Sí</Badge>
                    ) : (
                      <span>No</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h6>Información Técnica</h6>
            <Table size="sm">
              <tbody>
                <tr>
                  <td><strong>ID:</strong></td>
                  <td><code>{producto.id}</code></td>
                </tr>
                <tr>
                  <td><strong>Creado:</strong></td>
                  <td>{formatearFecha(producto.createdAt)}</td>
                </tr>
                <tr>
                  <td><strong>Actualizado:</strong></td>
                  <td>{formatearFecha(producto.updatedAt)}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ModalCategoria = ({ show, onHide, onSubmit, formulario, onChangeFormulario, categorias }) => {
  const [errores, setErrores] = useState({});

  const manejarEnvio = (e) => {
    e.preventDefault();
    
    // Validaciones
    const erroresValidacion = {};
    
    if (!formulario.nombre?.trim()) {
      erroresValidacion.nombre = 'El nombre es requerido';
    }
    
    const orden = parseInt(formulario.orden);
    if (isNaN(orden) || orden <= 0) {
      erroresValidacion.orden = 'El orden debe ser un número mayor a 0';
    }
    
    // Verificar si el orden ya existe
    const ordenExistente = categorias?.some(cat => 
      parseInt(cat.orden || 0) === orden
    );
    
    if (ordenExistente) {
      erroresValidacion.orden = 'Este número de orden ya está en uso';
    }
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    
    setErrores({});
    onSubmit(e);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Categoría
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={manejarEnvio}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Orden *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              placeholder="Ej: 1, 2, 3..."
              value={formulario.orden}
              onChange={(e) => onChangeFormulario({ ...formulario, orden: e.target.value })}
              isInvalid={!!errores.orden}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errores.orden}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Número mayor a 0. Menor número = aparece primero
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Tortas Circulares"
              value={formulario.nombre}
              onChange={(e) => onChangeFormulario({ ...formulario, nombre: e.target.value })}
              isInvalid={!!errores.nombre}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errores.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe la categoría..."
              value={formulario.descripcion}
              onChange={(e) => onChangeFormulario({ ...formulario, descripcion: e.target.value })}
            />
          </Form.Group>

          <Alert variant="info" className="mt-3">
            <div className="d-flex align-items-start">
              <i className="bi bi-info-circle me-2 mt-1"></i>
              <div>
                <strong>Nota:</strong>
                <ul className="mb-0 mt-1">
                  <li>El orden determina la posición en la tienda</li>
                </ul>
              </div>
            </div>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <i className="bi bi-check-circle me-1"></i>
            Crear Categoría
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const ModalEditarCategoria = ({ show, onHide, onSubmit, formulario, onChangeFormulario, categoria, categorias, cargando }) => {
  const [errores, setErrores] = useState({});

  const manejarEnvio = (e) => {
    e.preventDefault();
    
    // Validaciones
    const erroresValidacion = {};
    
    if (!formulario.nombre?.trim()) {
      erroresValidacion.nombre = 'El nombre es requerido';
    }
    
    const orden = parseInt(formulario.orden);
    if (isNaN(orden) || orden <= 0) {
      erroresValidacion.orden = 'El orden debe ser un número mayor a 0';
    }
    
    // Verificar si el orden ya existe (excluyendo la categoría actual)
    const ordenExistente = categorias?.some(cat => 
      cat.id !== categoria?.id && 
      parseInt(cat.orden || 0) === orden
    );
    
    if (ordenExistente) {
      erroresValidacion.orden = 'Este número de orden ya está en uso por otra categoría';
    }
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    
    setErrores({});
    onSubmit(e);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-pencil me-2"></i>
          Editar Categoría
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={manejarEnvio}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Orden *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={formulario.orden}
              onChange={(e) => onChangeFormulario({ ...formulario, orden: e.target.value })}
              isInvalid={!!errores.orden}
              required
              disabled={cargando}
            />
            <Form.Control.Feedback type="invalid">
              {errores.orden}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Determina el orden de aparición en la tienda
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              value={formulario.nombre}
              onChange={(e) => onChangeFormulario({ ...formulario, nombre: e.target.value })}
              isInvalid={!!errores.nombre}
              required
              disabled={cargando}
            />
            <Form.Control.Feedback type="invalid">
              {errores.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formulario.descripcion}
              onChange={(e) => onChangeFormulario({ ...formulario, descripcion: e.target.value })}
              disabled={cargando}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={cargando}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={cargando}>
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Guardar Cambios
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const ModalEliminarCategoria = ({ show, onHide, onConfirmar, categoria, cargando }) => {
  if (!categoria) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <i className="bi bi-exclamation-triangle me-2"></i>
          Eliminar Categoría
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <i className="bi bi-x-octagon fs-1 text-danger"></i>
          <h5 className="mt-3">¿Estás seguro de eliminar esta categoría?</h5>
          <p className="fw-bold">{categoria.nombre}</p>
          <p className="text-muted">
            ID: <code>{categoria.id}</code>
          </p>
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Advertencia:</strong> Esta acción no se puede deshacer.
            Se verificará que no haya productos usando esta categoría antes de eliminar.
          </Alert>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={cargando}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar} disabled={cargando}>
          {cargando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Verificando...
            </>
          ) : (
            'Sí, Eliminar'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileAdmin;