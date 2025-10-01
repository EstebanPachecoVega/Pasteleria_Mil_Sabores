import React, { useState } from 'react'

const AuthModals = ({ show, onHide, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login')
  const [regions, setRegions] = useState([])
  const [communes, setCommunes] = useState([])

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    // Lógica de login
    console.log('Login submitted')
    onLoginSuccess()
    onHide()
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    // Lógica de registro
    console.log('Register submitted')
    onLoginSuccess()
    onHide()
  }

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Acceso</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            <div className="d-flex justify-content-center gap-2">
              <button 
                className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('login')}
              >
                <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
              </button>
              <button 
                className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('register')}
              >
                <i className="bi bi-person-plus"></i> Registrarse
              </button>
            </div>

            {/* Formulario de Login */}
            {activeTab === 'login' && (
              <form id="loginForm" className="mt-3" onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label">Correo electrónico</label>
                  <input type="email" className="form-control" id="loginEmail" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                  <input type="password" className="form-control" id="loginPassword" required />
                </div>
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="rememberLogin" />
                  <label className="form-check-label" htmlFor="rememberLogin">Recordarme</label>
                </div>
                <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
              </form>
            )}

            {/* Formulario de Registro */}
            {activeTab === 'register' && (
              <form id="registerForm" className="mt-3" onSubmit={handleRegisterSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="registerRun" className="form-label">RUN</label>
                    <input type="text" className="form-control" id="registerRun" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="registerDiscountCode" className="form-label">Código de Descuento</label>
                    <input type="text" className="form-control" id="registerDiscountCode" />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="registerName" className="form-label">Nombre</label>
                    <input type="text" className="form-control" id="registerName" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="registerLastName" className="form-label">Apellidos</label>
                    <input type="text" className="form-control" id="registerLastName" required />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="registerEmail" className="form-label">Correo electrónico</label>
                    <input type="email" className="form-control" id="registerEmail" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="registerPassword" className="form-label">Contraseña</label>
                    <input type="password" className="form-control" id="registerPassword" required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100">Registrarse</button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onHide}></div>
    </div>
  )
}

export default AuthModals