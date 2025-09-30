import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/main.css'
import "simplebar/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimpleBar style={{ maxHeight: '100vh' }}>
      <App />
    </SimpleBar>
  </React.StrictMode>,
)