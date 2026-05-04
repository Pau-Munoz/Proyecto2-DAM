import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FileText, Plus, Edit2, Trash2, CheckSquare, XCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function Peticiones() {
  const [peticiones, setPeticiones] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPeticion, setEditingPeticion] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '', estado: 'Pendiente' });

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setCurrentUser(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchPeticiones = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/peticiones`);
      setPeticiones(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchPeticiones();
  }, [fetchCurrentUser, fetchPeticiones]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPeticion) {
        await axios.put(`${API_URL}/peticiones/${editingPeticion.id}`, formData);
      } else {
        await axios.post(`${API_URL}/peticiones`, formData);
      }
      setShowModal(false);
      fetchPeticiones();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la petición');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres borrar esta petición?')) {
      try {
        await axios.delete(`${API_URL}/peticiones/${id}`);
        fetchPeticiones();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'Completada': return { bg: '#dcfce7', text: '#166534', icon: <CheckSquare size={16} /> };
      case 'Rechazada': return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={16} /> };
      case 'En Desarrollo': return { bg: '#dbeafe', text: '#1e40af', icon: <AlertCircle size={16} /> };
      default: return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={16} /> };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} color="#6366f1" /> Peticiones y Mejoras
          </h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Propón nuevas ideas o reporta necesidades o errores de la aplicación.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { setEditingPeticion(null); setFormData({ titulo: '', descripcion: '', estado: 'Pendiente' }); setShowModal(true); }}
        >
          <Plus size={20} /> Nueva Petición
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {peticiones.map(pet => {
          const styleInfo = getStatusColor(pet.estado);
          const isOwner = currentUser?.id === pet.gestor_id;
          const isAdmin = currentUser?.rol?.toLowerCase() === 'admin';
          const canEdit = isOwner || isAdmin;

          return (
            <div key={pet.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', 
                  borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '700', 
                  backgroundColor: styleInfo.bg, color: styleInfo.text 
                }}>
                  {styleInfo.icon} {pet.estado}
                </span>
                
                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => { setEditingPeticion(pet); setFormData({ titulo: pet.titulo, descripcion: pet.descripcion, estado: pet.estado }); setShowModal(true); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pet.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0f172a', fontWeight: 'bold', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{pet.titulo}</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{pet.descripcion}</p>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                <span style={{ fontWeight: '600' }}>{pet.gestor?.nombre} {pet.gestor?.apellidos}</span>
                <span>{new Date(pet.fecha).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
        {peticiones.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No hay peticiones registradas. ¡Sé el primero en aportar una idea!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#0f172a', fontSize: '1.25rem' }}>
              {editingPeticion ? 'Editar Petición' : 'Nueva Petición'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Título de la sugerencia *</label>
                <input 
                  type="text" required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Descripción detallada *</label>
                <textarea 
                  required rows={5}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', resize: 'vertical' }}
                  value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              {currentUser?.rol?.toLowerCase() === 'admin' && editingPeticion && (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#ef4444' }}>Estado (Solo Admin)</label>
                  <select 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Desarrollo">En Desarrollo</option>
                    <option value="Completada">Completada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar Petición</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
