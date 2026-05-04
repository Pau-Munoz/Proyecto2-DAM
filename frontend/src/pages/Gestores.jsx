import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UserPlus, Users, Mail, Briefcase, Shield, X, Check, Phone, Lock, Edit2, Trash2, CheckSquare } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function Gestores() {
  const [gestores, setGestores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGestor, setEditingGestor] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); 
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [formData, setFormData] = useState({
    nombre: '', apellidos: '', email: '', contrasena: '', telefono: '', id_departamento: '', rol: 'gestor'
  });

  const fetchGestores = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/gestores`);
      setGestores(res.data);
    } catch (err) {
      console.error('Error fetching gestores:', err);
    }
  }, []);

  const fetchDeps = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/departamentos`);
      setDepartamentos(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, []);

  useEffect(() => {
    fetchGestores();
    fetchDeps();
  }, [fetchGestores, fetchDeps]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      if (editingGestor) {
        await axios.put(`${API_URL}/gestores/${editingGestor.id}`, formData);
      } else {
        await axios.post(`${API_URL}/gestores`, formData);
      }
      
      setSaveStatus('success');
      fetchGestores();
      
      setTimeout(() => {
        setShowModal(false);
        setEditingGestor(null);
        setSaveStatus(null);
        setFormData({ nombre: '', apellidos: '', email: '', contrasena: '', telefono: '', id_departamento: '', rol: 'gestor' });
      }, 1500);
    } catch (err) {
      setSaveStatus('error');
      alert(err.response?.data?.error || 'Error al procesar solicitud');
    }
  };

  const handleEdit = (g) => {
    setEditingGestor(g);
    setFormData({
      nombre: g.nombre,
      apellidos: g.apellidos,
      email: g.email,
      contrasena: '',
      telefono: g.telefono || '',
      id_departamento: g.id_departamento,
      rol: g.rol
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) return alert('No puedes eliminarte a ti mismo');
    if (window.confirm('¿Estás seguro de eliminar este gestor? Se perderá el acceso permanentemente.')) {
      try {
        await axios.delete(`${API_URL}/gestores/${id}`);
        fetchGestores();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>Personal y Accesos</h1>
          <p style={{ color: '#64748b' }}>Gestión de cuentas corporativas y permisos del sistema.</p>
        </div>
        {currentUser?.rol === 'admin' && (
          <button className="btn btn-primary" onClick={() => { setEditingGestor(null); setFormData({ nombre: '', apellidos: '', email: '', contrasena: '', telefono: '', id_departamento: '', rol: 'gestor' }); setShowModal(true); }}>
            <UserPlus size={20} /> Nuevo Gestor
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Gestor</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Departamento</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Rol</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gestores.map(g => (
              <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {g.nombre?.[0]}{g.apellidos?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{g.nombre} {g.apellidos}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {g.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    {g.departamento?.nombre || 'General'}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', 
                    background: g.rol === 'admin' ? '#fff7ed' : '#f0fdf4',
                    color: g.rol === 'admin' ? '#9a3412' : '#166534',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                  }}>
                    <Shield size={12} /> {g.rol.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  {currentUser?.rol?.toLowerCase() === 'admin' && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem', marginRight: '0.5rem' }} onClick={() => handleEdit(g)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn" style={{ padding: '0.5rem', color: '#ef4444' }} onClick={() => handleDelete(g.id)}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '95vh', overflowY: 'auto', padding: '0', borderRadius: '1.25rem' }}>
            {saveStatus === 'success' ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckSquare size={40} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>¡Personal Actualizado!</h2>
                <p style={{ color: '#64748b' }}>Los cambios en la cuenta de gestor se han guardado correctamente.</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{editingGestor ? 'Editar' : 'Registrar'} Gestor</h3>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.5rem' }}><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {/* Bloque: Identidad */}
                  <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} /> Identidad Personal
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Nombre *</label>
                        <input type="text" placeholder="Ej: Juan" required style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Apellidos *</label>
                        <input type="text" placeholder="Ej: García López" required style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Bloque: Seguridad y Contacto */}
                  <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={18} /> Seguridad y Contacto
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Email Corporativo *</label>
                        <input type="email" placeholder="usuario@gestorleads.com" required style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>{editingGestor ? 'Cambiar Contraseña' : 'Contraseña *'}</label>
                        <input type="password" placeholder={editingGestor ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'} required={!editingGestor} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.contrasena} onChange={e => setFormData({...formData, contrasena: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Teléfono Móvil</label>
                        <input type="text" placeholder="+34 600 000 000" style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Bloque: Organización */}
                  <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Briefcase size={18} /> Estructura Organizativa
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Departamento *</label>
                        <select required style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', background: 'white' }} value={formData.id_departamento} onChange={e => setFormData({...formData, id_departamento: e.target.value})}>
                          <option value="">Seleccionar...</option>
                          {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Rol de Acceso</label>
                        <select style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', background: 'white' }} value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                          <option value="gestor">Gestor Standard</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1.25rem', fontSize: '1.1rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                      {editingGestor ? 'Guardar Cambios' : 'Finalizar Alta'}
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '1rem' }} onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gestores;
