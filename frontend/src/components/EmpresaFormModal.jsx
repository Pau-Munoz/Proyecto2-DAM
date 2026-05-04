import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, MapPin, CheckSquare, X } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function EmpresaFormModal({ initialData, estados, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '', estado_id: '', direccion: '', telefono: '', email: '', web: '', convenio: false, fecha_convenio: ''
  });
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null

  // Initialize data when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fecha_convenio: initialData.fecha_convenio?.split('T')[0] || '',
        estado_id: initialData.estado_id || ''
      });
    } else {
      setFormData({
        nombre: '', estado_id: '', direccion: '', telefono: '', email: '', web: '', convenio: false, fecha_convenio: ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      if (initialData && initialData.id) {
        await axios.put(`${API_URL}/empresas/${initialData.id}`, formData);
      } else {
        await axios.post(`${API_URL}/empresas`, formData);
      }
      
      setSaveStatus('success');
      onSaveSuccess();
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setSaveStatus('error');
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '95vh', overflowY: 'auto', padding: '0', borderRadius: '1.25rem' }}>
        {saveStatus === 'success' ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckSquare size={40} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>¡Guardado con éxito!</h2>
            <p style={{ color: '#64748b' }}>La empresa ha sido registrada correctamente en el sistema.</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{initialData ? 'Editar' : 'Nueva'} Empresa</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.5rem' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* Bloque: Identidad Corporativa */}
              <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={18} /> Identidad Corporativa
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Nombre Fiscal *</label>
                    <input type="text" placeholder="Nombre completo de la empresa" required style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Estado Comercial *</label>
                    <select required style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', background: 'white' }} value={formData.estado_id} onChange={e => setFormData({...formData, estado_id: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {estados?.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque: Información de Contacto */}
              <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} /> Contacto y Ubicación
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Email Principal</label>
                    <input type="email" placeholder="ejemplo@empresa.com" style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Teléfono de Red</label>
                    <input type="text" placeholder="+34 000 000 000" style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Sede Social / Dirección</label>
                    <input type="text" placeholder="Calle, Número, Ciudad, Provincia, CP" style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>Sitio Web Corporativo</label>
                    <input type="text" placeholder="https://www.empresa.com" style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} value={formData.web} onChange={e => setFormData({...formData, web: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Bloque: Estatus Legal */}
              <div style={{ background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                      style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${formData.convenio ? '#6366f1' : '#cbd5e1'}`, background: formData.convenio ? '#6366f1' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setFormData({...formData, convenio: !formData.convenio})}
                    >
                      {formData.convenio && <CheckSquare size={16} color="white" />}
                    </div>
                    <label style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Certificación de Convenio Activo</label>
                  </div>
                  {formData.convenio && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', animation: 'fadeIn 0.3s' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#64748b' }}>Fecha de Firma:</label>
                      <input type="date" style={{ padding: '0.6rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} value={formData.fecha_convenio} onChange={e => setFormData({...formData, fecha_convenio: e.target.value})} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1.25rem', fontSize: '1.1rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                  {initialData ? 'Actualizar Registro' : 'Inscribir Empresa'}
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '1rem' }} onClick={onClose}>
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default EmpresaFormModal;
