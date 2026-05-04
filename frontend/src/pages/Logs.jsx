import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { History, User, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Error fetching user');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchLogs();
  }, [fetchCurrentUser, fetchLogs]);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Cargando logs...</div>;

  if (currentUser?.rol?.toLowerCase() !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden ver el log global de auditoría.</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/home')}>Volver al Panel</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>Auditoría del Sistema</h1>
        <p style={{ color: '#64748b' }}>Seguimiento completo de todas las acciones realizadas por los gestores.</p>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Fecha</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Gestor</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Acción / Descripción</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No hay actividad registrada.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> {new Date(log.fecha).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#1e293b', fontSize: '0.875rem' }}>
                    <User size={14} /> {log.gestor?.nombre} {log.gestor?.apellidos}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>
                  {log.descripcion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Logs;
