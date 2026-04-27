import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import { useAuth } from '../context/AuthContext';

export default function MaterialApoio() {
  const { userRole } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', size: '', type: 'PDF' });
  const [isSaving, setIsSaving] = useState(false);

  // Mock data for initial state or if DB table doesn't exist
  const mockMaterials = [
    { id: 1, title: 'Manual de Utilização do Portal', type: 'PDF', size: '1.2 MB', url: '#' },
    { id: 2, title: 'Guia de Dashboards - Bradesco SA', type: 'PDF', size: '2.5 MB', url: '#' },
    { id: 3, title: 'Relatório Trimestral - RCB', type: 'PDF', size: '4.1 MB', url: '#' },
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
      if (error) {
        console.log("Usando dados de exemplo para material de apoio.");
        setMaterials(mockMaterials);
      } else if (data && data.length > 0) {
        setMaterials(data);
      } else {
        setMaterials(mockMaterials);
      }
    } catch (err) {
      setMaterials(mockMaterials);
    } finally {
      setLoading(false);
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Tenta salvar no Supabase (se a tabela existir)
      const { data, error } = await supabase.from('materials').insert([
        { 
          title: newMaterial.title, 
          url: newMaterial.url, 
          size: newMaterial.size || 'N/A', 
          type: newMaterial.type 
        }
      ]).select();

      if (error) {
        // Se a tabela não existir, apenas atualizamos o estado local para demonstração
        console.warn("Tabela 'materials' não encontrada ou erro ao inserir. Simulando adição local.");
        const mockItem = { 
          id: Date.now(), 
          ...newMaterial, 
          size: newMaterial.size || '0.0 MB' 
        };
        setMaterials([mockItem, ...materials]);
      } else {
        setMaterials([data[0], ...materials]);
      }
      
      setShowModal(false);
      setNewMaterial({ title: '', url: '', size: '', type: 'PDF' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#153d7a' }}>Carregando materiais...</div>;

  return (
    <div style={{ marginTop: '30px', position: 'relative' }}>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        
        {/* BOTÃO ADICIONAR (Visível apenas para gerência) */}
        {userRole === 'gerencia' && (
          <div 
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: 'rgba(21, 61, 122, 0.03)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '220px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#153d7a';
              e.currentTarget.style.backgroundColor = 'rgba(21, 61, 122, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = 'rgba(21, 61, 122, 0.03)';
            }}
          >
            <span style={{ fontSize: '32px', color: '#153d7a' }}>+</span>
            <span style={{ fontWeight: '600', color: '#153d7a' }}>Anexar Novo PDF</span>
          </div>
        )}

        {materials.map((item) => (
          <div 
            key={item.id} 
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
              minHeight: '220px',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              📄
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                margin: '0 0 4px 0', 
                color: '#1e293b', 
                fontSize: '16px',
                fontWeight: '600',
                lineHeight: '1.4'
              }}>
                {item.title}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                color: '#94a3b8',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>
                {item.type} • {item.size}
              </p>
            </div>

            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#153d7a',
                color: '#fff',
                textDecoration: 'none',
                textAlign: 'center',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1e40af'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#153d7a'}
            >
              Visualizar PDF
            </a>
          </div>
        ))}
      </div>

      {/* MODAL PARA ADICIONAR (Simplificado) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '32px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#153d7a' }}>Anexar Material</h2>
            <form onSubmit={handleAddMaterial}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                  Título do Material
                </label>
                <input 
                  required
                  type="text" 
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  placeholder="Ex: Manual Operacional"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                  URL do PDF (Link do Supabase ou Externo)
                </label>
                <input 
                  required
                  type="text" 
                  value={newMaterial.url}
                  onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                    Tamanho (opcional)
                  </label>
                  <input 
                    type="text" 
                    value={newMaterial.size}
                    onChange={(e) => setNewMaterial({...newMaterial, size: e.target.value})}
                    placeholder="Ex: 2.5 MB"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                    Tipo
                  </label>
                  <select 
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOC">DOC</option>
                    <option value="XLS">XLS</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    backgroundColor: '#153d7a', 
                    color: '#fff', 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
