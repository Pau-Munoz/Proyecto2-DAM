import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remembered user on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { email, contrasena });
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '3rem', 
        borderRadius: '1.5rem', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: '#6366f1', 
            borderRadius: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>
            Acceso al Sistema
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fee2e2',
            color: '#991b1b', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            fontSize: '0.875rem',
            animation: 'shake 0.5s'
          }}>
            <AlertCircle size={20} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
              Email o Usuario
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="usuario@empresa.com" 
                required
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
                value={contrasena} 
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
            <div style={{ 
              width: '18px', 
              height: '18px', 
              border: `2px solid ${rememberMe ? '#6366f1' : '#cbd5e1'}`, 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: rememberMe ? '#6366f1' : 'white',
              transition: 'all 0.2s'
            }}>
              {rememberMe && <CheckCircle2 size={14} style={{ color: 'white' }} />}
            </div>
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500', userSelect: 'none' }}>Recordar usuario</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              fontSize: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'} {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
