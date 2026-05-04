import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit2, Trash2, MapPin, CheckSquare, X, Filter, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmpresaFormModal from '../components/EmpresaFormModal';

const API_URL = 'http://localhost:3001/api';

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  
  // Filtros
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDept, setFilterDept] = useState(true); // "Solo mi departamento" por defecto true

  const fetchCurrentUser = useCallback(async () => {
    const res = await axios.get(`${API_URL}/auth/me`);
    setCurrentUser(res.data);
  }, []);

  const fetchEmpresas = useCallback(async (pEstado = filterEstado, pDept = filterDept) => {
    console.log(`[FRONTEND] Fetching companies - State: Estado=${filterEstado}, Dept=${filterDept}`);
    console.log(`[FRONTEND] Args: Estado=${pEstado}, Dept=${pDept}`);

    let url = `${API_URL}/empresas?`;
    if (pEstado) {
      url += `estado_id=${pEstado}&`;
    }
    
    // Si pDept es true, enviamos el ID del departamento del usuario
    if (pDept && currentUser?.id_departamento) {
      url += `departamento_id=${currentUser.id_departamento}&`;
    }
    
    console.log(`[FRONTEND] Request URL: ${url}`);
    
    try {
      const res = await axios.get(url);
      console.log(`[FRONTEND] Companies received: ${res.data.length}`);
      setEmpresas(res.data);
    } catch (err) {
      console.error('[FRONTEND] Error fetching companies:', err);
    }
  }, [filterEstado, filterDept, currentUser]);

  const fetchEstados = async () => {
    const res = await axios.get(`${API_URL}/estados`);
    setEstados(res.data);
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchEstados();
  }, [fetchCurrentUser]);

  // Solo carga inicial cuando el usuario está disponible
  useEffect(() => {
    if (currentUser) {
      fetchEmpresas();
    }
  }, [currentUser]); // Eliminado fetchEmpresas de dependencias para evitar bucle/auto-refresh

  const handleApplyFilters = () => {
    fetchEmpresas();
  };

  const handleClearFilters = () => {
    setFilterEstado('');
    setFilterDept(false);
    fetchEmpresas('', false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
      try {
        await axios.delete(`${API_URL}/empresas/${id}`);
        fetchEmpresas();
      } catch (err) {
        alert(err.response?.data?.error || 'No tienes permisos');
      }
    }
  };

  return (
    <div className="empresas-container">
      {/* ... header ... */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>Gestión de Leads</h1>
          <p style={{ color: '#64748b' }}>Filtra y administra las empresas del sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingEmpresa(null); setShowModal(true); }}>
          <Plus size={20} /> Nueva Empresa
        </button>
      </div>

      {/* ... filters ... */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', background: '#f8fafc', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="#64748b" />
          <span style={{ fontWeight: '700', color: '#475569', fontSize: '0.875rem' }}>Filtros:</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', margin: 0 }}>Estado:</label>
          <select 
            value={filterEstado} 
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }}
          >
            <option value="">Todos los estados</option>
            {estados.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setFilterDept(!filterDept)}>
          <div style={{ 
            width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${filterDept ? '#6366f1' : '#cbd5e1'}`,
            background: filterDept ? '#6366f1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}>
            {filterDept && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Solo mi departamento</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={handleApplyFilters} style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
            Aplicar filtros
          </button>
          <button className="btn btn-secondary" onClick={handleClearFilters} style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
            Limpiar
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Empresa</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Depto. Creador</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No se encontraron empresas con estos filtros.</td></tr>
            ) : empresas.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>
                    <Link to={`/empresas/${emp.id}`} style={{ textDecoration: 'none', color: '#0f172a' }} className="hover:text-indigo-600">
                      {emp.nombre}
                    </Link>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.email}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', background: '#eef2ff', color: '#4338ca' }}>
                    {emp.estado?.nombre || 'Sin Estado'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                    <Users size={14} /> {emp.creador?.departamento?.nombre || 'Sin Departamento'}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  {(currentUser?.rol?.toLowerCase() === 'admin' || emp.creado_por === currentUser?.id) && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', marginRight: '0.5rem' }} onClick={() => { setEditingEmpresa(emp); setShowModal(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => handleDelete(emp.id)}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <EmpresaFormModal 
          initialData={editingEmpresa}
          estados={estados}
          onClose={() => setShowModal(false)}
          onSaveSuccess={() => fetchEmpresas()}
        />
      )}
    </div>
  );
}

export default Empresas;
