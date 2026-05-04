import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Building2, Clock, User, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function Buscador() {
  const [empresas, setEmpresas] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInteracted = async (newLimit) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/empresas/interactuadas?limit=${newLimit}`);
      setEmpresas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteracted(limit);
  }, [limit]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>Explorador de Interacciones</h1>
        <p style={{ color: '#64748b' }}>Empresas con las que has mantenido contacto activo.</p>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Listado de Empresas Interactuadas</h3>
        </div>

        {loading && empresas.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Cargando listado...</div>
        ) : empresas.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>No has interactuado con ninguna empresa todavía.</p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Los leads donde dejes mensajes aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {empresas.map((emp) => {
              const lastMsg = emp.ultimo_mensaje;
              return (
                <div key={emp.id} 
                  onClick={() => navigate(`/empresas/${emp.id}`)}
                  style={{ 
                    padding: '1.5rem', 
                    borderBottom: '1px solid #f1f5f9', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }} className="list-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{emp.nombre}</h2>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} /> Alta: {new Date(emp.fecha_alta).toLocaleDateString()}
                        </span>
                        <span style={{ 
                          padding: '0.1rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', fontWeight: '600', color: '#475569' 
                        }}>
                          {emp.estado?.nombre}
                        </span>
                        <span>Convenio: {emp.convenio ? 'Sí' : 'No'}</span>
                      </div>
                    </div>
                    <ArrowRight size={20} color="#cbd5e1" />
                  </div>

                  {lastMsg && (
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', borderLeft: '4px solid #6366f1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase' }}>Último Mensaje</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(lastMsg.fecha).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#334155', fontStyle: 'italic' }}>
                        "{lastMsg.contenido}"
                      </p>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b' }}>
                        <User size={12} /> <span style={{ fontWeight: '600' }}>{lastMsg.autor}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setLimit(prev => prev + 20)}>Ver 20 más</button>
              <button className="btn btn-secondary" onClick={() => setLimit(prev => prev + 100)}>Ver todos</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .list-item:hover { background-color: #f5f7ff; transform: translateX(4px); }
      `}</style>
    </div>
  );
}

export default Buscador;
