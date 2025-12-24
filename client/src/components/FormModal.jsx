import { useState, useEffect } from 'react';
import { noteApi } from '../contexts/NotesApi';

const FormModal = (props) => {
    const {
        showFormModal,
        setShowFormModal,
        mode = 'add',
        noteId = null,
        onSuccess = null,
        onCancel = null,
        initialFormData = null
    } = props;

    const [formData, setFormData] = useState({
        fullName: '',
        shortName: '',
        birthDate: '',
        age: '',
        race: '',
        description: '',
        history: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initial, setInitial] = useState('A');
    const [error, setError] = useState('');
    useEffect(() => {
        if (showFormModal) {
            setError('');
            if (mode === 'add') {
                if (initialFormData) {
                    setFormData(initialFormData);
                    setInitial(initialFormData.fullName?.charAt(0)?.toUpperCase() || 'A');
                } else {
                    setFormData({
                        fullName: '',
                        shortName: '',
                        birthDate: '',
                        age: '',
                        race: '',
                        description: '',
                        history: ''
                    });
                    setInitial('A');
                }
                setLoading(false);
            } else if (mode === 'edit' || mode === 'view') {
                loadNoteData();
            }
        }
    }, [showFormModal, mode, noteId]);

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
                
                setFormData({
                    fullName: dataObj.fullName || '',
                    shortName: dataObj.shortName || '',
                    birthDate: dataObj.birthDate || '',
                    age: dataObj.age || '',
                    race: dataObj.race || '',
                    description: dataObj.description || '',
                    history: dataObj.history || ''
                });
                const initialChar = dataObj.fullName?.charAt(0)?.toUpperCase() || 'A';
                setInitial(initialChar);
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
        if (field === 'fullName') {
            const newInitial = value.charAt(0)?.toUpperCase() || 'A';
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
        if (!formData.fullName?.trim()) {
            setError('Поле "Полное имя" обязательно для заполнения');
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
                await noteApi.addForm(formData, 0);
            } else if (mode === 'edit') {
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

        if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
            try {
                setSaving(true);
                await noteApi.delete(noteId);
                
                if (onSuccess) {
                    onSuccess();
                }
                
                setShowFormModal(false);
            } catch (error) {
                console.error('Ошибка при удалении:', error);
                setError('Не удалось удалить анкету');
            } finally {
                setSaving(false);
            }
        }
    };

    const getTitle = () => {
        switch(mode) {
            case 'add': return 'Создание анкеты';
            case 'edit': return 'Редактирование анкеты';
            case 'view': return 'Просмотр анкеты';
            default: return 'Создание анкеты';
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
        if (props.onSwitchToEdit) {
            props.onSwitchToEdit(noteId);
        }
    };
    const isViewMode = mode === 'view';
    const isDisabled = loading || saving;

    if (!showFormModal) return null;

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
                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                                <div className="user-avatar-outline" style={{ width: '80px', height: '80px', flexShrink: 0, marginTop: '0.5rem' }}>
                                    {initial}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <label style={{ width: '140px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', flexShrink: 0 }}>
                                            Полное имя
                                        </label>
                                        {isViewMode ? (
                                            <div className="input">
                                                {formData.fullName || '-'}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                className="input"
                                                value={formData.fullName}
                                                onChange={(e) => handleFormDataChange('fullName', e.target.value)}
                                                placeholder="Введите полное имя"
                                                style={{ flex: 1 }}
                                                disabled={isDisabled}
                                            />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <label style={{ width: '140px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', flexShrink: 0 }}>
                                            Сокращенное имя
                                        </label>
                                        {isViewMode ? (
                                            <div className="input">
                                                {formData.shortName || '-'}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                className="input"
                                                value={formData.shortName}
                                                onChange={(e) => handleFormDataChange('shortName', e.target.value)}
                                                placeholder="Введите сокращенное имя"
                                                style={{ flex: 1 }}
                                                disabled={isDisabled}
                                            />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginLeft: '56px' }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <label style={{ width: '90px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', flexShrink: 0 }}>
                                                Дата рождения
                                            </label>
                                            {isViewMode ? (
                                                <div className="input">
                                                    {formData.birthDate || '-'}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={formData.birthDate}
                                                    onChange={(e) => handleFormDataChange('birthDate', e.target.value)}
                                                    placeholder="дд.мм.гггг"
                                                    style={{ flex: 1 }}
                                                    disabled={isDisabled}
                                                />
                                            )}
                                        </div>
                                        
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <label style={{ width: '60px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', flexShrink: 0 }}>
                                                Возраст
                                            </label>
                                            {isViewMode ? (
                                                <div className="input">
                                                    {formData.age || '-'}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={formData.age}
                                                    onChange={(e) => handleFormDataChange('age', e.target.value)}
                                                    placeholder="Возраст"
                                                    style={{ flex: 1 }}
                                                    disabled={isDisabled}
                                                />
                                            )}
                                        </div>
                                        
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <label style={{ width: '40px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', flexShrink: 0 }}>
                                                Раса
                                            </label>
                                            {isViewMode ? (
                                                <div className="input">
                                                    {formData.race || '-'}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={formData.race}
                                                    onChange={(e) => handleFormDataChange('race', e.target.value)}
                                                    placeholder="Раса"
                                                    style={{ flex: 1 }}
                                                    disabled={isDisabled}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Описание
                                </label>
                                {isViewMode ? (
                                    <div className="input textarea">
                                        {formData.description || '-'}
                                    </div>
                                ) : (
                                    <textarea
                                        className="input textarea"
                                        value={formData.description}
                                        onChange={(e) => handleFormDataChange('description', e.target.value)}
                                        placeholder="Введите описание"
                                        rows="3"
                                        style={{ width: '100%' }}
                                        disabled={isDisabled}
                                    />
                                )}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    История
                                </label>
                                {isViewMode ? (
                                    <div className="input textarea">
                                        {formData.history || '-'}
                                    </div>
                                ) : (
                                    <textarea
                                        className="input textarea"
                                        value={formData.history}
                                        onChange={(e) => handleFormDataChange('history', e.target.value)}
                                        placeholder="Введите историю"
                                        rows="3"
                                        style={{ width: '100%' }}
                                        disabled={isDisabled}
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-actions-single" style={{ justifyContent: 'flex-end', padding: '1.5rem', gap: '1rem', display: 'flex' }}>
                            {mode === 'edit' && (
                                <button 
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    style={{ minWidth: '140px', backgroundColor: '#dc3545', borderColor: '#dc3545' }}
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
                                >
                                    {getSaveButtonText()}
                                </button>
                            )}
                            
                            {mode === 'view' && (
                                <>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={switchToEditMode}
                                >
                                    РЕДАКТИРОВАТЬ
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleCancelForm}
                                >
                                    ЗАКРЫТЬ
                                </button>
                                </>
                                
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FormModal;