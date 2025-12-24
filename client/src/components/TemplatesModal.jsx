import { useState, useEffect } from 'react';
import { patternApi } from '../contexts/PatternApi';

const TemplatesModal = ({ showTemplatesModal, setShowTemplatesModal, onTemplateSelect, mode = 'select' }) => {
  const [templates, setTemplates] = useState([]);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateFields, setTemplateFields] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (showTemplatesModal) {
      loadTemplates();
    }
  }, [showTemplatesModal]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const userTemplates = await patternApi.get();
      // Фильтруем, чтобы не показывать дефолтный шаблон (id=0)
      const filteredTemplates = userTemplates.filter(t => t.id !== 0);
      setTemplates(filteredTemplates);
    } catch (err) {
      console.error('Ошибка загрузки шаблонов:', err);
      setError('Не удалось загрузить шаблоны');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = () => {
    setTemplateName('');
    setTemplateFields('');
    setShowAddTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Название шаблона обязательно');
      return;
    }

    try {
      setLoading(true);
      // Преобразуем строку полей в массив
      const fieldsArray = templateFields.split(',').map(field => field.trim()).filter(field => field !== '');
      
      if (fieldsArray.length === 0) {
        setError('Добавьте хотя бы одно поле');
        return;
      }

      await patternApi.create(templateName, fieldsArray);
      setShowAddTemplateModal(false);
      loadTemplates();
      setError('');
    } catch (err) {
      console.error('Ошибка создания шаблона:', err);
      setError('Не удалось создать шаблон');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    if (mode === 'select' && onTemplateSelect) {
      onTemplateSelect(template);
      setShowTemplatesModal(false);
    }
  };

  if (!showTemplatesModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowTemplatesModal(false)}>
      <div className="user-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '400' }}>Управление шаблонами</h3>
          <button 
            className="modal-close"
            onClick={() => setShowTemplatesModal(false)}
          >
            ×
          </button>
        </div>
        
        <div className="modal-content" style={{ padding: '1.5rem' }}>
          {error && (
            <div className="error-message" style={{ color: '#dc3545', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <div >
            <button 
              className="black-outline-btn"
              onClick={handleAddTemplate}
              style={{ marginBottom: '1rem', width: '100%'}}
            >
              Добавить шаблон
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</div>
          ) : (
            <div className="templates-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {templates.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  У вас пока нет шаблонов
                </p>
              ) : (
                templates.map(template => (
                  <div 
                    key={template.id} 
                    className="template-item"
                    onClick={() => handleTemplateClick(template)}
                    style={{ 
                      cursor: mode === 'select' ? 'pointer' : 'default',
                      background: 'linear-gradient(90deg, #f8f9fa, #ffffff)',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid #e9ecef',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                        {template.name || `Шаблон ${template.id}`}
                      </h4>
                      {mode !== 'select' && (
                        <button 
                          className="delete-btn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Удалить шаблон?')) {
                              await patternApi.delete(template.id);
                              loadTemplates();
                            }
                          }}
                          style={{ background: 'none', border: 'none', padding: '0.2rem', cursor: 'pointer' }}
                        >
                          <img src="/delete.svg" alt="Удалить" style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>Поля:</strong> {Array.isArray(template.fields) ? template.fields.join(', ') : 'Нет полей'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно добавления шаблона */}
      {showAddTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowAddTemplateModal(false)}>
          <div className="user-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '400' }}>Добавить шаблон</h3>
              <button className="modal-close" onClick={() => setShowAddTemplateModal(false)}>×</button>
            </div>
            
            <div className="modal-content" style={{ padding: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Название шаблона*</label>
                <input
                  type="text"
                  className="input"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Введите название шаблона"
                  required
                />
              </div>
              
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Поля шаблона* (через запятую)</label>
                <textarea
                  className="input textarea"
                  value={templateFields}
                  onChange={(e) => setTemplateFields(e.target.value)}
                  placeholder="Например: Имя, Возраст, Описание, История"
                  rows="4"
                />
              </div>
            </div>
            
            <div className="modal-actions-double" style={{ padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem' }}>
              <button 
                className="black-outline-btn" 
                onClick={() => setShowAddTemplateModal(false)}
                style={{ flex: 1 }}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveTemplate}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesModal;