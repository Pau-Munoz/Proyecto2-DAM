import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Phone, Mail, Globe, MapPin, Calendar, CheckCircle2, XCircle, ArrowLeft, MessageSquare, Plus, Users, Tag, X, Send, Edit2 } from 'lucide-react';
import EmpresaFormModal from '../components/EmpresaFormModal';

const API_URL = 'http://localhost:3001/api';

function FichaEmpresa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [contactos, setContactos] = useState([]);
  const [allIntereses, setAllIntereses] = useState([]);
  const [estados, setEstados] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgData, setMsgData] = useState({ mensaje: '', tipo: 'normal', fijado: false });
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactData, setContactData] = useState({ 
    nombre: '', 
    apellidos: '', 
    cargo: '', 
    email: '', 
    telefono: '', 
    intereses_ids: [] 
  });
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTag, setNewTag] = useState('');

  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setCurrentUser(res.data);
    } catch (err) {
      console.error('No se pudo cargar el usuario actual');
    }
  }, []);

  const fetchEmpresa = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/empresas/${id}`);
      setEmpresa(res.data);
    } catch (err) {
      setError('No se pudo encontrar la empresa o no tienes acceso.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchContactos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/contactos?empresa_id=${id}`);
      setContactos(res.data);
    } catch (err) {
      console.error('Error al cargar contactos');
    }
  }, [id]);

  const fetchAllIntereses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/intereses`);
      setAllIntereses(res.data);
    } catch (err) {
      console.error('Error al cargar catálogo de intereses');
    }
  }, []);

  const fetchEstados = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/estados`);
      setEstados(res.data);
    } catch (err) {
      console.error('Error al cargar estados');
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchEmpresa();
    fetchContactos();
    fetchAllIntereses();
    fetchEstados();
  }, [fetchCurrentUser, fetchEmpresa, fetchContactos, fetchAllIntereses, fetchEstados]);

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/mensajes`, { ...msgData, empresa_id: id });
      setShowMsgModal(false);
      setMsgData({ mensaje: '', tipo: 'normal', fijado: false });
      fetchEmpresa();
    } catch (err) {
      alert('Error al enviar mensaje');
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await axios.put(`${API_URL}/contactos/${editingContact.id}`, { ...contactData, empresa_id: id });
      } else {
        await axios.post(`${API_URL}/contactos`, { ...contactData, empresa_id: id });
      }
      setShowContactModal(false);
      setEditingContact(null);
      setContactData({ nombre: '', apellidos: '', cargo: '', email: '', telefono: '', intereses_ids: [] });
      fetchContactos();
      fetchEmpresa(); // Para logs si es necesario
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar contacto');
    }
  };

  const handleUpdateTags = async () => {
    try {
      await axios.post(`${API_URL}/empresas/${id}/intereses`, { intereses_ids: selectedTagIds });
      setShowTagsModal(false);
      fetchEmpresa(); // Para recargar los intereses y logs
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar etiquetas');
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/intereses`, { nombre: newTag });
      await fetchAllIntereses();
      setSelectedTagIds(prev => [...prev, res.data.id]);
      setNewTag('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear etiqueta');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('¿Eliminar este contacto?')) return;
    try {
      await axios.delete(`${API_URL}/contactos/${contactId}`);
      fetchContactos();
      fetchEmpresa();
    } catch (err) {
      alert(err.response?.data?.error || 'No tienes permiso para eliminar este contacto');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Cargando ficha de empresa...</div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>
      <XCircle size={48} style={{ margin: '0 auto 1rem' }} />
      <h2>{error}</h2>
      <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/home')}>Volver al Panel</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '600' }}>
        <ArrowLeft size={20} /> Volver
      </button>

      {/* Sistema de TABs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('info')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'info' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'info' ? '#6366f1' : '#64748b',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} /> Información
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('contactos')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'contactos' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'contactos' ? '#6366f1' : '#64748b',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Contactos
          </div>
        </button>
      </div>

      {activeTab === 'info' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{empresa.nombre}</h1>
                    {(currentUser?.rol?.toLowerCase() === 'admin' || empresa.creado_por === currentUser?.id) && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setShowEditModal(true)} title="Editar Empresa">
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '700', background: '#f5f7ff', color: '#6366f1' }}>
                      {empresa.estado?.nombre || 'Prospecto'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={16} /> Alta el {new Date(empresa.fecha_alta).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {empresa.convenio && (
                  <div style={{ background: '#f0fdf4', color: '#166534', padding: '0.5rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                    <CheckCircle2 size={20} /> Con Convenio
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                <InfoItem icon={<MapPin size={18} />} label="Dirección" value={empresa.direccion} />
                <InfoItem icon={<Phone size={18} />} label="Teléfono" value={empresa.telefono} />
                <InfoItem icon={<Mail size={18} />} label="Email Principal" value={empresa.email} />
                <InfoItem icon={<Globe size={18} />} label="Sitio Web" value={empresa.web} />
              </div>

              {/* Etiquetas / Intereses */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Tag size={20} color="#6366f1" /> 
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>Etiquetas (Intereses)</h4>
                  {(currentUser?.rol?.toLowerCase() === 'admin' || empresa.creado_por === currentUser?.id) && (
                    <button 
                      onClick={() => {
                        setSelectedTagIds(empresa.intereses?.map(i => i.id) || []);
                        setShowTagsModal(true);
                      }}
                      style={{ background: '#f5f7ff', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Editar etiquetas"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {empresa.intereses?.length > 0 ? (
                    empresa.intereses.map(int => (
                      <span key={int.id} style={{ padding: '0.4rem 0.8rem', background: '#eef2ff', color: '#4f46e5', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                        {int.nombre}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin etiquetas asignadas.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Historial de Interacciones */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><MessageSquare size={24} color="#6366f1" /> Historial</h3>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowMsgModal(true)}><Plus size={18} /> Nuevo Mensaje</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {empresa.mensajes?.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hay interacciones.</p>
                ) : (
                  empresa.mensajes.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(msg => (
                    <div key={msg.id} style={{ padding: '1rem', background: msg.fijado ? '#fffbeb' : '#f8fafc', borderRadius: '0.75rem', border: msg.fijado ? '1px solid #fde68a' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: '#475569' }}>{msg.gestor?.nombre} {msg.gestor?.apellidos}</span>
                        <span style={{ color: '#94a3b8' }}>{new Date(msg.fecha).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.925rem' }}>{msg.mensaje}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info (Optional compact version if info tab is active) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}>
               <h4 style={{ margin: '0 0 1rem 0' }}>Gestión de Prospecto</h4>
               <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Utiliza las pestañas para gestionar los contactos comerciales y el historial de comunicaciones.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Users size={28} color="#6366f1" /> Contactos Comerciales</h2>
            {(currentUser?.rol?.toLowerCase() === 'admin' || currentUser?.id_departamento === empresa?.creador?.id_departamento) && (
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setEditingContact(null); setContactData({ nombre: '', apellidos: '', cargo: '', email: '', telefono: '', intereses_ids: [] }); setShowContactModal(true); }}>
                <Plus size={20} /> Nuevo Contacto
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'left' }}>
                  <th style={{ padding: '0 1rem' }}>Nombre</th>
                  <th style={{ padding: '0 1rem' }}>Cargo</th>
                  <th style={{ padding: '0 1rem' }}>Intereses</th>
                  <th style={{ padding: '0 1rem' }}>Email / Tel</th>
                  <th style={{ padding: '0 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contactos.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No hay contactos registrados para esta empresa.</td>
                  </tr>
                ) : (
                  contactos.map(contact => (
                    <tr key={contact.id} className="table-row-hover" style={{ background: 'white', borderRadius: '1rem' }}>
                      <td style={{ padding: '1rem', fontWeight: '700', borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem' }}>
                        {contact.nombre} {contact.apellidos}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: '#f5f7ff', color: '#6366f1', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>
                          {contact.cargo || 'Sin cargo'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {contact.intereses?.length > 0 ? contact.intereses.map(int => (
                            <span key={int.id} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '9999px', color: '#475569', background: '#f8fafc' }}>
                              {int.nombre}
                            </span>
                          )) : <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>-</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span>{contact.email || '-'}</span>
                           <span style={{ opacity: 0.7 }}>{contact.telefono || '-'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                        {(currentUser?.rol?.toLowerCase() === 'admin' || contact.creado_por === currentUser?.id) && (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => {
                                setContactData({
                                  nombre: contact.nombre || '',
                                  apellidos: contact.apellidos || '',
                                  cargo: contact.cargo || '',
                                  email: contact.email || '',
                                  telefono: contact.telefono || '',
                                  intereses_ids: contact.intereses?.map(i => i.id) || []
                                });
                                setEditingContact(contact);
                                setShowContactModal(true);
                              }} 
                              style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0.5rem' }}
                              title="Editar contacto"
                            >
                              <Edit2 size={20} />
                            </button>
                            {currentUser?.rol?.toLowerCase() === 'admin' && (
                              <button 
                                onClick={() => handleDeleteContact(contact.id)} 
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                title="Eliminar contacto"
                              >
                                <XCircle size={20} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Mensaje */}
      {showMsgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Registrar Interacción</h3>
              <X onClick={() => setShowMsgModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleCreateMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea placeholder="Escribe el mensaje aquí..." required rows={4} value={msgData.mensaje} onChange={e => setMsgData({...msgData, mensaje: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }} />
              <select value={msgData.tipo} onChange={e => setMsgData({...msgData, tipo: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', background: 'white' }}>
                <option value="normal">Normal</option>
                <option value="infolium">INFOLIUM</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Enviar Mensaje</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Contacto */}
      {showContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>{editingContact ? 'Editar Contacto' : 'Añadir Contacto'}</h3>
              <X onClick={() => setShowContactModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Nombre" required style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={contactData.nombre} onChange={e => setContactData({...contactData, nombre: e.target.value})} />
                <input type="text" placeholder="Apellidos" style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={contactData.apellidos} onChange={e => setContactData({...contactData, apellidos: e.target.value})} />
              </div>
              <input type="text" placeholder="Cargo" style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={contactData.cargo} onChange={e => setContactData({...contactData, cargo: e.target.value})} />
              <input type="email" placeholder="Email" style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} />
              <input type="text" placeholder="Teléfono" style={{ width: '100%', boxSizing: 'border-box', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={contactData.telefono} onChange={e => setContactData({...contactData, telefono: e.target.value})} />
              
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Intereses</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {allIntereses.map(int => (
                    <button
                      key={int.id}
                      type="button"
                      onClick={() => {
                        const isSelected = contactData.intereses_ids.includes(int.id);
                        setContactData({
                          ...contactData,
                          intereses_ids: isSelected 
                            ? contactData.intereses_ids.filter(id => id !== int.id)
                            : [...contactData.intereses_ids, int.id]
                        });
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid',
                        borderColor: contactData.intereses_ids.includes(int.id) ? '#6366f1' : '#e2e8f0',
                        background: contactData.intereses_ids.includes(int.id) ? '#6366f1' : 'white',
                        color: contactData.intereses_ids.includes(int.id) ? 'white' : '#64748b'
                      }}
                    >
                      {int.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Guardar Contacto</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Etiquetas Empresa */}
      {showTagsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Gestionar Etiquetas</h3>
              <X onClick={() => setShowTagsModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Selecciona los intereses/etiquetas asociadas a esta empresa.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {allIntereses.map(int => {
                  const isSelected = selectedTagIds.includes(int.id);
                  return (
                    <button
                      key={int.id}
                      type="button"
                      onClick={() => {
                        setSelectedTagIds(isSelected 
                          ? selectedTagIds.filter(id => id !== int.id)
                          : [...selectedTagIds, int.id]
                        );
                      }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid',
                        borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                        background: isSelected ? '#6366f1' : 'white',
                        color: isSelected ? 'white' : '#64748b'
                      }}
                    >
                      {int.nombre}
                    </button>
                  );
                })}
              </div>
              
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>¿No encuentras la etiqueta?</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Ej. Mujeres, DAM..." 
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag(e); } }}
                    style={{ flex: 1, minWidth: 0, padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                  <button onClick={handleCreateTag} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Crear</button>
                </div>
              </div>

              <button onClick={handleUpdateTags} className="btn btn-primary" style={{ width: '100%' }}>Guardar Etiquetas</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EmpresaFormModal 
          initialData={empresa}
          estados={estados}
          onClose={() => setShowEditModal(false)}
          onSaveSuccess={() => fetchEmpresa()}
        />
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div>
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: '500' }}>
        {icon} <span>{value || 'No disponible'}</span>
      </div>
    </div>
  );
}

export default FichaEmpresa;
