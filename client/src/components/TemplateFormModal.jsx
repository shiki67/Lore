import { useState, useEffect } from 'react';
import { noteApi } from '../contexts/NotesApi';

const TemplateFormModal = (props) => {
    const {
        showFormModal,
        setShowFormModal,
        template,
        mode = 'add', // 'add', 'edit', 'view'
        noteId = null,
        onSuccess = null,
        onCancel = null,
        onSwitchToEdit = null,
    } = props;

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initial, setInitial] = useState('T');
    const [error, setError] = useState('');
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (showFormModal) {
            if (mode === 'add' && template) {
                loadTemplateFields();
            } else if ((mode === 'edit' || mode === 'view') && noteId) {
                loadNoteData();
            }
        }
    }, [showFormModal, mode, noteId, template]);

    const loadTemplateFields = () => {
        setError('');
        setLoading(true);
        
        try {
            if (template && template.fields && Array.isArray(template.fields)) {
                setFields(template.fields);
                const initialData = {};
                template.fields.forEach(field => {
                    initialData[field] = '';
                });
                setFormData(initialData);
                if (template.name) {
                    setInitial(template.name.charAt(0)?.toUpperCase() || 'T');
                } else if (template.fields.length > 0 && template.fields[0]) {
                    setInitial(template.fields[0].charAt(0)?.toUpperCase() || 'T');
                }
            } else {
                const defaultFields = ["Название", "Описание"];
                setFields(defaultFields);
                
                const initialData = {};
                defaultFields.forEach(field => {
                    initialData[field] = '';
                });
                setFormData(initialData);
                setInitial('T');
            }
        } catch (err) {
            console.error('Ошибка при загрузке полей шаблона:', err);
            setError('Не удалось загрузить поля шаблона');
        } finally {
            setLoading(false);
        }
    };

    const loadNoteData = async () => {
        try {
            setLoading(true);
            setError('');
            const note = await noteApi.getNoteById(noteId);
            
            if (note && note.data) {
                let dataObj = note.data;
                if (typeof dataObj === 'string') {
                    try {
                        dataObj = JSON.parse(dataObj);
                    } catch (e) {
                        dataObj = {};
                    }
                }
                
                setFormData(dataObj);
                
                // Определяем поля из шаблона или данных
                if (note.pattern_id !== 0 && template) {
                    // Используем поля из шаблона
                    setFields(template.fields || Object.keys(dataObj));
                } else {
                    // Используем поля из данных
                    const dataFields = Object.keys(dataObj);
                    setFields(dataFields);
                }
                
                // Устанавливаем инициалиал из первого поля
                const firstFieldValue = Object.values(dataObj)[0];
                if (firstFieldValue && typeof firstFieldValue === 'string') {
                    setInitial(firstFieldValue.charAt(0)?.toUpperCase() || 'T');
                } else if (template?.name) {
                    setInitial(template.name.charAt(0)?.toUpperCase() || 'T');
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных заметки:', error);
            setError('Не удалось загрузить данные заметки');
        } finally {
            setLoading(false);
        }
    };

    const handleFormDataChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Обновляем инициалиал, если меняется первое поле
        if (fields.length > 0 && field === fields[0] && value) {
            const newInitial = value.charAt(0)?.toUpperCase() || 'T';
            setInitial(newInitial);
        }
    };

    const handleCancelForm = () => {
        if (onCancel) {
            onCancel();
        }
        setShowFormModal(false);
    };

    const validateForm = () => {
        if (fields.length > 0 && !formData[fields[0]]?.trim()) {
            setError(`Поле "${fields[0]}" обязательно для заполнения`);
            return false;
        }
        setError('');
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);
            setError('');

            if (mode === 'add') {
            console.log('Создание заметки с шаблоном:', template); // Для отладки
            console.log('ID шаблона:', template.id); // Для отладки
            
            // Убедитесь, что template.id существует и не равен 0
            if (!template.id || template.id === 0) {
                setError('Ошибка: неверный ID шаблона');
                return;
            }
            
            // Создаем заметку по шаблону с правильным pattern_id
            await noteApi.addForm(formData, template.id);
            } else if (mode === 'edit' && noteId) {
            // Обновляем существующую заметку
            await noteApi.update(noteId, formData);
            }
            
            if (onSuccess) {
            onSuccess();
            }
            setShowFormModal(false);
            
        } catch (error) {
            console.error('Ошибка при сохранении формы:', error);
            setError('Не удалось сохранить форму. Попробуйте еще раз.');
        } finally {
            setSaving(false);
        }
        };

    const handleDelete = async () => {
        if (!noteId || mode !== 'edit') return;

        if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
            try {
                setSaving(true);
                await noteApi.delete(noteId);
                
                if (onSuccess) {
                    onSuccess();
                }
                
                setShowFormModal(false);
            } catch (error) {
                console.error('Ошибка при удалении:', error);
                setError('Не удалось удалить заметку');
            } finally {
                setSaving(false);
            }
        }
    };

    const getTitle = () => {
        switch(mode) {
            case 'add': 
                return template ? `Создание по шаблону: ${template.name || 'Шаблон'}` : 'Создание заметки';
            case 'edit': return 'Редактирование заметки';
            case 'view': return 'Просмотр заметки';
            default: return 'Заметка по шаблону';
        }
    };

    const getSaveButtonText = () => {
        if (saving) return 'СОХРАНЕНИЕ...';
        switch(mode) {
            case 'add': return 'СОХРАНИТЬ';
            case 'edit': return 'ОБНОВИТЬ';
            default: return 'СОХРАНИТЬ';
        }
    };

    const switchToEditMode = () => {
        if (onSwitchToEdit) {
            onSwitchToEdit(noteId);
        }
    };

    const isViewMode = mode === 'view';
    const isDisabled = loading || saving;

    if (!showFormModal || (mode === 'add' && !template)) return null;

    return (
        <div className="modal-overlay" onClick={handleCancelForm} style={{ overflowY: 'auto', padding: '2rem 0' }}>
            <div className="user-modal-wide" onClick={(e) => e.stopPropagation()} style={{ 
                maxWidth: '900px', 
                width: '90vw', 
                margin: 'auto',
                position: 'relative'
            }}>
                <div className="modal-header">
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '400' }}>{getTitle()}</h3>
                    {loading && <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666' }}>Загрузка...</span>}
                    <button 
                        className="modal-close"
                        onClick={handleCancelForm}
                        disabled={isDisabled}
                    >
                        ×
                    </button>
                </div>
                
                {error && (
                    <div style={{ padding: '0 1.5rem' }}>
                        <div className="error-message" style={{ color: '#dc3545', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    </div>
                )}
                
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Загрузка данных...</p>
                    </div>
                ) : (
                    <>
                        <div className="user-profile" style={{ padding: '1.5rem' }}>
                            {/* Первая строка: аватарка + первое поле в одну линию */}
                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                                <div className="user-avatar-outline" style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    flexShrink: 0, 
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    fontWeight: 'bold'
                                }}>
                                    {initial}
                                </div>
                                
                                {/* Первое поле рядом с аватаркой */}
                                {fields.length > 0 && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ 
                                            fontFamily: 'Poppins, sans-serif', 
                                            fontSize: '1rem', 
                                            fontWeight: '500',
                                            color: 'var(--text-primary)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {fields[0]}
                                        </label>
                                        {isViewMode ? (
                                            <div 
                                                className="input textarea"
                                                style={{ 
                                                    minHeight: '56px',
                                                    // height: '48px',
                                                    maxHeight: '200px',
                                                    padding: '0.75rem 1rem',
                                                    border: '2px solid var(--input-bg)',
                                                    borderRadius: 'var(--border-radius)',
                                                    backgroundColor: 'var(--input-bg)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    overflowY: 'auto',
                                                    resize: 'none',
                                                    cursor: 'default'
                                                }}
                                            >
                                                {formData[fields[0]] || '-'}
                                            </div>
                                        ) : (
                                            <textarea
                                                className="input textarea"
                                                value={formData[fields[0]] || ''}
                                                onChange={(e) => handleFormDataChange(fields[0], e.target.value)}
                                                placeholder={`Введите ${fields[0].toLowerCase()}`}
                                                style={{ 
                                                    minHeight: '56px',
                                                    // height: '48px',
                                                    maxHeight: '200px',
                                                    width: '100%',
                                                    fontFamily: 'inherit',
                                                    fontSize: '1rem',
                                                    border: '2px solid var(--input-bg)',
                                                    borderRadius: 'var(--border-radius)',
                                                    backgroundColor: isDisabled ? '#f5f5f5' : 'var(--input-bg)',
                                                    transition: 'all 0.3s ease',
                                                    resize: 'vertical',
                                                    overflowY: 'auto',
                                                    lineHeight: '1.7'
                                                }}
                                                disabled={isDisabled}
                                                rows="1"
                                                onFocus={(e) => {
                                                    if (!isDisabled) {
                                                        e.target.style.borderColor = 'var(--primary-color)';
                                                        e.target.style.backgroundColor = 'var(--surface-color)';
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (!isDisabled) {
                                                        e.target.style.borderColor = 'var(--input-bg)';
                                                        e.target.style.backgroundColor = 'var(--input-bg)';
                                                    }
                                                }}
                                                onInput={(e) => {
                                                    // Автоматическое изменение высоты
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Остальные поля - во всю ширину */}
                            {fields.length > 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {fields.slice(1).map((field, index) => (
                                        <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ 
                                                fontFamily: 'Poppins, sans-serif', 
                                                fontSize: '1rem', 
                                                fontWeight: '500',
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {field}
                                            </label>
                                            {isViewMode ? (
                                                <div 
                                                    className="input textarea"
                                                    style={{ 
                                                        minHeight: '56px',
                                                        // height: '48px',
                                                        maxHeight: '200px',
                                                        padding: '0.75rem 1rem',
                                                        border: '2px solid var(--input-bg)',
                                                        borderRadius: 'var(--border-radius)',
                                                        backgroundColor: 'var(--input-bg)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        overflowY: 'auto',
                                                        resize: 'none',
                                                        cursor: 'default'
                                                    }}
                                                >
                                                    {formData[field] || '-'}
                                                </div>
                                            ) : (
                                                <textarea
                                                    className="input textarea"
                                                    value={formData[field] || ''}
                                                    onChange={(e) => handleFormDataChange(field, e.target.value)}
                                                    placeholder={`Введите ${field.toLowerCase()}`}
                                                    style={{ 
                                                        minHeight: '56px',
                                                        // height: '48px',
                                                        maxHeight: '200px',
                                                        width: '100%',
                                                        fontFamily: 'inherit',
                                                        fontSize: '1rem',
                                                        padding: '0.75rem 1rem',
                                                        border: '2px solid var(--input-bg)',
                                                        borderRadius: 'var(--border-radius)',
                                                        backgroundColor: isDisabled ? '#f5f5f5' : 'var(--input-bg)',
                                                        transition: 'all 0.3s ease',
                                                        resize: 'vertical',
                                                        overflowY: 'auto',
                                                        lineHeight: '1.7'
                                                    }}
                                                    disabled={isDisabled}
                                                    rows="1"
                                                    onFocus={(e) => {
                                                        if (!isDisabled) {
                                                            e.target.style.borderColor = 'var(--primary-color)';
                                                            e.target.style.backgroundColor = 'var(--surface-color)';
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        if (!isDisabled) {
                                                            e.target.style.borderColor = 'var(--input-bg)';
                                                            e.target.style.backgroundColor = 'var(--input-bg)';
                                                        }
                                                    }}
                                                    onInput={(e) => {
                                                        // Автоматическое изменение высоты
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {fields.length === 0 && (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                    Нет полей для отображения
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-actions-single" style={{ 
                            justifyContent: 'flex-end', 
                            padding: '1.5rem', 
                            gap: '1rem', 
                            display: 'flex',
                            borderTop: '1px solid #eee'
                        }}>
                            {mode === 'edit' && (
                                <button 
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    style={{ 
                                        minWidth: '140px', 
                                        backgroundColor: '#dc3545', 
                                        borderColor: '#dc3545',
                                        fontFamily: 'Next Art, sans-serif'
                                    }}
                                    disabled={isDisabled}
                                >
                                    {saving ? 'УДАЛЕНИЕ...' : 'УДАЛИТЬ'}
                                </button>
                            )}
                            
                            {mode !== 'view' && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={isDisabled}
                                    style={{ fontFamily: 'Next Art, sans-serif' }}
                                >
                                    {getSaveButtonText()}
                                </button>
                            )}
                            
                            {mode === 'view' && (
                                <>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={switchToEditMode}
                                        style={{ fontFamily: 'Next Art, sans-serif' }}
                                    >
                                        РЕДАКТИРОВАТЬ
                                    </button>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={handleCancelForm}
                                        style={{ fontFamily: 'Next Art, sans-serif' }}
                                    >
                                        ЗАКРЫТЬ
                                    </button>
                                </>
                            )}
                            
                            {mode !== 'view' && (
                                <button 
                                    className="btn btn-secondary"
                                    onClick={handleCancelForm}
                                    disabled={isDisabled}
                                    style={{ fontFamily: 'Next Art, sans-serif' }}
                                >
                                    ОТМЕНА
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TemplateFormModal;