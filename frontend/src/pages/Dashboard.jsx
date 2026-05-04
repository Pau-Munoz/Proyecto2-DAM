import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, Building2, MessageSquare, ArrowRight, Clock, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  const fetchLogs = async (newLimit) => {
    try {
      const res = await axios.get(`${API_URL}/logs/me?limit=${newLimit}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(limit);
  }, [limit]);

  const handleLoadMore = (amount) => {
    setLimit(prev => prev + amount);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
          ¡Hola de nuevo, {currentUser?.nombre}! 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Aquí tienes un resumen de tus últimas interacciones y acciones en el sistema.
        </p>
        
        <div style={{ marginTop: '1.5rem', background: '#eff6ff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#1e40af' }}>
          <UserCheck size={18} />
          <div>
            <strong>Estado de Sesión (Debug):</strong> ID {currentUser?.id} | Rol Activo: <span style={{ textTransform: 'uppercase', fontWeight: '800' }}>{currentUser?.rol}</span>
          </div>
        </div>
      </header>

      <section className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc' }}>
          <History size={20} color="#6366f1" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Tu Actividad Reciente</h2>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Cargando actividad...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ background: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <UserCheck size={32} color="#94a3b8" />
            </div>
            <p style={{ color: '#64748b', fontWeight: '500', fontSize: '1.1rem' }}>
              Actualmente no hay registros para este gestor.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Tus acciones (crear empresas, mensajes, etc.) aparecerán aquí.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ padding: '0.5rem 0' }}>
              {logs.map((log) => (
                <div key={log.id} style={{ 
                  padding: '1.25rem 1.5rem', 
                  borderBottom: '1px solid #f1f5f9', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  transition: 'background 0.2s'
                }} className="log-item">
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ marginTop: '0.25rem' }}>
                      {log.descripcion.includes('Empresa') ? <Building2 size={18} color="#6366f1" /> : <MessageSquare size={18} color="#10b981" />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{log.descripcion}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Clock size={12} /> {new Date(log.fecha).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {log.empresa && (
                      <Link to={`/empresas/${log.empresa.id}`} style={linkButtonStyle}>
                        Ver Empresa <ArrowRight size={14} />
                      </Link>
                    )}
                    {log.mensaje && (
                      <span style={{ ...linkButtonStyle, cursor: 'default', background: '#f1f5f9', color: '#64748b' }}>
                        Msg #{log.mensaje.id}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', background: '#f8fafc' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => handleLoadMore(20)}>
                Ver 20 más
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => handleLoadMore(100)}>
                Ver 100 más
              </button>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .log-item:hover { background-color: #f8fafc; }
      `}</style>
    </div>
  );
}

const linkButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.4rem 0.75rem',
  borderRadius: '6px',
  background: '#eef2ff',
  color: '#4338ca',
  fontSize: '0.75rem',
  fontWeight: '700',
  textDecoration: 'none',
  transition: 'all 0.2s'
};

export default Dashboard;
