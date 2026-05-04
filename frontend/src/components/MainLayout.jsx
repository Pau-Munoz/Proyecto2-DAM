import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, History, LogOut, Bell, Search, User, Settings, FileText, SearchCode } from 'lucide-react';

function MainLayout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/home', icon: <LayoutDashboard size={18} /> },
    { name: 'Empresas', path: '/empresas', icon: <Building2 size={18} /> },
    { name: 'Gestores', path: '/gestores', icon: <Users size={18} /> },
    { name: 'Mantenimientos', path: '/mantenimientos', icon: <Settings size={18} /> },
    { name: 'Buscador', path: '/buscador', icon: <SearchCode size={18} /> },
    { name: 'Peticiones', path: '/peticiones', icon: <FileText size={18} /> },
  ];

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
      {/* Top Navbar */}
      <nav style={{ 
        height: '64px', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <div style={{ width: '32px', height: '32px', background: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>GestorLeads</h1>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: isActive ? '#6366f1' : '#64748b',
                backgroundColor: isActive ? '#f5f7ff' : 'transparent',
                transition: 'all 0.2s'
              })}
            >
              {link.icon} {link.name}
            </NavLink>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>{user?.nombre}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{user?.rol}</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: '#6366f1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'all 0.2s',
                ...(showProfilePopup ? { borderColor: '#818cf8', boxShadow: '0 0 0 2px #e0e7ff' } : {})
              }}
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              title="Cuenta de usuario"
            >
              {user?.nombre?.charAt(0)?.toUpperCase()}
            </div>

            {showProfilePopup && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowProfilePopup(false)} />
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 15px)', 
                  right: 0, 
                  background: 'white', 
                  borderRadius: '1.25rem', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  padding: '2rem 1.5rem',
                  width: '300px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', background: '#6366f1', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
                    fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' 
                  }}>
                    {user?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>¡Hola, {user?.nombre?.split(' ')[0]}!</h3>
                  <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>{user?.email}</p>
                  
                  <div style={{ 
                    background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '2rem', 
                    fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' 
                  }}>
                    Rol Activo: {user?.rol}
                  </div>  
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={onLogout} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '0.5rem', 
              border: '1px solid #e2e8f0', 
              background: 'white', 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.target.style.background = '#fef2f2'; }}
            onMouseOut={(e) => { e.target.style.background = 'white'; }}
          >
            <LogOut size={18} /> <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
