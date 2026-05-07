import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import Gestores from './pages/Gestores';
import Logs from './pages/Logs';
import LoginPage from './pages/LoginPage';
import Buscador from './pages/Buscador';
import FichaEmpresa from './pages/FichaEmpresa';
import Peticiones from './pages/Peticiones';
import Mantenimiento from './pages/Mantenimiento';
import MainLayout from './components/MainLayout';

const Placeholder = ({ name }) => (
  <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
    <h2 style={{ color: '#64748b' }}>Sección de {name}</h2>
    <p>Funcionalidad completa en desarrollo...</p>
  </div>
);

// Axios Interceptor for Auth
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function ProtectedRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  const handleLogin = (token, userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage onLogin={handleLogin} />} />

        {/* Private Routes wrapped in MainLayout */}
        <Route path="/*" element={
          <ProtectedRoute user={user}>
            <MainLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/home" element={<Dashboard />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/empresas/:id" element={<FichaEmpresa />} />
                <Route path="/gestores" element={<Gestores />} />
                <Route path="/mantenimientos" element={<Mantenimiento />} />
                <Route path="/buscador" element={<Buscador />} />
                <Route path="/peticiones" element={<Peticiones />} />
                <Route path="/logs" element={<Logs />} />
                
                {/* Redirections */}
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="*" element={<Navigate to="/home" />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
