import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings, Plus, Edit2, Trash2, Check, X, Tag, Layers, ToggleLeft } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// ── Reutilizable: lista editable ──────────────────────────────────────────────
function CatalogSection({ title, icon: Icon, color, items, onAdd, onEdit, onDelete, isAdmin }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setError('');
    try {
      await onAdd(newName.trim());
      setNewName('');
    } catch (e) {
      setError(e.response?.data?.error || 'Error al añadir');
    }
  };

  const handleEdit = async (id) => {
    if (!editingName.trim()) return;
    setError('');
    try {
      await onEdit(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    } catch (e) {
      setError(e.response?.data?.error || 'Error al editar');
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setError('');
    try {
      await onDelete(id);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1, minWidth: '280px' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '0.75rem'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{title}</h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{items.length} elemento{items.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '0.75rem 1rem', padding: '0.6rem 1rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* Add input (admin only) */}
      {isAdmin && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Nuevo ${title.toLowerCase().slice(0, -1)}...`}
            style={{
              flex: '1 1 120px', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none',
              transition: 'border-color 0.2s', minWidth: '0'
            }}
            onFocus={e => e.target.style.borderColor = color}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: 'none',
              background: color, color: 'white', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: '700',
              transition: 'opacity 0.2s', flexShrink: 0
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            <Plus size={15} /> Añadir
          </button>
        </div>
      )}

      {/* Items list */}
      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#cbd5e1', fontSize: '0.875rem' }}>
            No hay elementos
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid #f8fafc',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: editingId === item.id ? '#f8fafc' : 'white',
              transition: 'background 0.15s'
            }}>
              {editingId === item.id ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                    style={{
                      flex: 1, padding: '0.375rem 0.625rem', borderRadius: '0.4rem',
                      border: `1.5px solid ${color}`, fontSize: '0.875rem', outline: 'none'
                    }}
                  />
                  <button onClick={() => handleEdit(item.id)} style={{ background: '#dcfce7', border: 'none', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer', color: '#16a34a' }}><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer', color: '#64748b' }}><X size={14} /></button>
                </>
              ) : (
                <>
                  <span style={{
                    flex: 1, fontSize: '0.9rem', fontWeight: '600', color: '#334155',
                    padding: '0.2rem 0.5rem', borderRadius: '6px',
                    background: `${color}10`, display: 'inline-block',
                    wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {item.nombre}
                  </span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => { setEditingId(item.id); setEditingName(item.nombre); setError(''); }}
                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', color: '#475569', transition: 'background 0.15s' }}
                        title="Editar"
                      ><Edit2 size={13} /></button>
                      <button
                        onClick={() => handleDelete(item.id, item.nombre)}
                        style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', color: '#ef4444', transition: 'background 0.15s' }}
                        title="Eliminar"
                      ><Trash2 size={13} /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
function Mantenimiento() {
  const [estados, setEstados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [intereses, setIntereses] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.rol?.toLowerCase() === 'admin';

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [e, d, i] = await Promise.all([
        axios.get(`${API_URL}/estados`),
        axios.get(`${API_URL}/departamentos`),
        axios.get(`${API_URL}/intereses`)
      ]);
      setEstados(e.data);
      setDepartamentos(d.data);
      setIntereses(i.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Estados
  const addEstado = async (nombre) => { await axios.post(`${API_URL}/estados`, { nombre }); fetchAll(); };
  const editEstado = async (id, nombre) => { await axios.put(`${API_URL}/estados/${id}`, { nombre }); fetchAll(); };
  const deleteEstado = async (id) => { await axios.delete(`${API_URL}/estados/${id}`); fetchAll(); };

  // Departamentos
  const addDept = async (nombre) => { await axios.post(`${API_URL}/departamentos`, { nombre }); fetchAll(); };
  const editDept = async (id, nombre) => { await axios.put(`${API_URL}/departamentos/${id}`, { nombre }); fetchAll(); };
  const deleteDept = async (id) => { await axios.delete(`${API_URL}/departamentos/${id}`); fetchAll(); };

  // Intereses
  const addInteres = async (nombre) => { await axios.post(`${API_URL}/intereses`, { nombre }); fetchAll(); };
  const editInteres = async (id, nombre) => { await axios.put(`${API_URL}/intereses/${id}`, { nombre }); fetchAll(); };
  const deleteInteres = async (id) => { await axios.delete(`${API_URL}/intereses/${id}`); fetchAll(); };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} color="white" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Mantenimiento</h1>
        </div>
        <p style={{ color: '#64748b', marginLeft: '3.5rem' }}>
          Gestiona las opciones de los desplegables del sistema.
          {!isAdmin && <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontWeight: '600' }}>⚠ Solo los administradores pueden modificar estos valores.</span>}
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Cargando catálogos...</div>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <CatalogSection
            title="Estados"
            icon={ToggleLeft}
            color="#6366f1"
            items={estados}
            onAdd={addEstado}
            onEdit={editEstado}
            onDelete={deleteEstado}
            isAdmin={isAdmin}
          />
          <CatalogSection
            title="Departamentos"
            icon={Layers}
            color="#0ea5e9"
            items={departamentos}
            onAdd={addDept}
            onEdit={editDept}
            onDelete={deleteDept}
            isAdmin={isAdmin}
          />
          <CatalogSection
            title="Etiquetas"
            icon={Tag}
            color="#10b981"
            items={intereses}
            onAdd={addInteres}
            onEdit={editInteres}
            onDelete={deleteInteres}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
}

export default Mantenimiento;
