import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Search, Clock, User, ArrowRight, AlertCircle, Tag, X, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function Buscador() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [intereses, setIntereses] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const fetchIntereses = async () => {
    try {
      const res = await axios.get(`${API_URL}/intereses`);
      setIntereses(res.data);
    } catch (err) {
      console.error('Error cargando intereses:', err);
    }
  };

  const fetchEmpresas = useCallback(async (overrideQuery, overrideTags) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    const tags = overrideTags !== undefined ? overrideTags : selectedTags;
    try {
      setLoading(true);
      let url = `${API_URL}/empresas?`;
      if (q.trim()) url += `q=${encodeURIComponent(q.trim())}&`;
      if (tags.length > 0) url += `intereses=${tags.join(',')}&`;
      const res = await axios.get(url);
      setEmpresas(res.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTags]);

  useEffect(() => {
    fetchIntereses();
    fetchEmpresas();
  }, []);

  // Re-fetch when tags change
  useEffect(() => {
    if (hasSearched) {
      fetchEmpresas();
    }
  }, [selectedTags]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmpresas();
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    // Pass empty values directly to avoid stale closure
    fetchEmpresas('', []);
  };

  const hasFilters = searchQuery.trim() || selectedTags.length > 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' }}>
          Buscador
        </h1>
        <p style={{ color: '#64748b' }}>Busca y filtra todas las empresas del sistema.</p>
      </header>

      {/* Search & Filter Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: intereses.length > 0 ? '1rem' : 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar empresa por nombre..."
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}>
            Buscar
          </button>
          {hasFilters && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <X size={15} /> Limpiar
            </button>
          )}
        </form>

        {/* Tag filters */}
        {intereses.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Tag size={15} color="#6366f1" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Filtrar por etiquetas
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {intereses.map(interes => {
                const active = selectedTags.includes(interes.id);
                return (
                  <button
                    key={interes.id}
                    onClick={() => toggleTag(interes.id)}
                    style={{
                      padding: '0.3rem 0.85rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      border: active ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
                      background: active ? '#eef2ff' : 'white',
                      color: active ? '#4338ca' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {active && <X size={11} />}
                    {interes.nombre}
                  </button>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6366f1', fontWeight: '600' }}>
                {selectedTags.length} etiqueta{selectedTags.length > 1 ? 's' : ''} seleccionada{selectedTags.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Resultados</h3>
          </div>
          {!loading && (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
              {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Cargando...</div>
        ) : empresas.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            {hasFilters ? (
              <>
                <p style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  Sin resultados
                </p>
                {searchQuery.trim() && (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    No se encontró ninguna empresa con el nombre <strong>"{searchQuery.trim()}"</strong>.
                  </p>
                )}
                {selectedTags.length > 0 && (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Prueba con otras etiquetas o limpia los filtros.
                  </p>
                )}
                <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                  Limpiar filtros
                </button>
              </>
            ) : (
              <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
                No hay empresas registradas todavía.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {empresas.map((emp) => {
              const lastMsg = emp.ultimo_mensaje;
              return (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/empresas/${emp.id}`)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="list-item"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: '0 0 0.375rem 0', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                        {emp.nombre}
                      </h2>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} /> {new Date(emp.fecha_alta).toLocaleDateString()}
                        </span>
                        {emp.estado && (
                          <span style={{ padding: '0.1rem 0.5rem', borderRadius: '4px', background: '#eef2ff', fontWeight: '700', color: '#4338ca' }}>
                            {emp.estado.nombre}
                          </span>
                        )}
                        {emp.creador?.departamento && (
                          <span style={{ color: '#94a3b8' }}>{emp.creador.departamento.nombre}</span>
                        )}
                        <span>Convenio: {emp.convenio ? 'Sí' : 'No'}</span>
                      </div>

                      {/* Tags */}
                      {emp.intereses && emp.intereses.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                          {emp.intereses.map(tag => (
                            <span
                              key={tag.id}
                              style={{
                                padding: '0.15rem 0.65rem',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                background: selectedTags.includes(tag.id) ? '#eef2ff' : '#f8fafc',
                                color: selectedTags.includes(tag.id) ? '#4338ca' : '#64748b',
                                border: selectedTags.includes(tag.id) ? '1px solid #a5b4fc' : '1px solid #e2e8f0'
                              }}
                            >
                              {tag.nombre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Last message */}
                      {lastMsg && (
                        <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.75rem', borderLeft: '4px solid #6366f1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase' }}>Último mensaje</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(lastMsg.fecha).toLocaleString()}</span>
                          </div>
                          <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic' }}>
                            "{lastMsg.contenido}"
                          </p>
                          <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b' }}>
                            <User size={11} /> <span style={{ fontWeight: '600' }}>{lastMsg.autor}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <ArrowRight size={20} color="#cbd5e1" style={{ marginLeft: '1rem', flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
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
