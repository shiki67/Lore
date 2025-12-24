import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { noteApi } from '../contexts/NotesApi';
import { patternApi } from '../contexts/PatternApi';
import UserModal from '../components/UserModal';
import FormModal from '../components/FormModal';
import TemplateFormModal from '../components/TemplateFormModal';

const ProjectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [projectNotes, setProjectNotes] = useState([]);
  const [freeNotes, setFreeNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState('view');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const project = location.state?.project || { 
    id: 1, 
    name: 'Название проекта',
    description: 'Описание проекта'
  };
  
  const [userData, setUserData] = useState({
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (showUserModal && user) {
      setUserData({
        nickname: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [showUserModal, user]);

  useEffect(() => {
    loadProjectResources();
  }, [project.id]);

const loadProjectResources = async () => {
  try {
    setLoading(true);
    const notesInProject = await noteApi.getNotesForProject(project.id);
    
    console.log('Заметки в проекте (сырые данные):', notesInProject); // Для отладки
    
    const formattedNotes = notesInProject.map(item => {
      console.log('Заметка ID:', item.id, 'pattern_id:', item.pattern_id); // Для отладки
      
      let dataObj = item.data;
      let displayName = 'Без названия';
      
      if (typeof dataObj === 'string') {
        try {
          dataObj = JSON.parse(dataObj);
        } catch (e) {
          dataObj = {};
        }
      }
      
      if (dataObj && typeof dataObj === 'object') {
        const values = Object.values(dataObj);
        if (values.length > 0) {
          displayName = String(values[0] || '');
        }
      }
      
      return {
        id: item.id,
        name: displayName,
        type: 'form',
        icon: '/personalcard.svg',
        data: dataObj,
        project_id: item.project_id,
        pattern_id: item.pattern_id || 0
      };
    });
    
    console.log('Отформатированные заметки:', formattedNotes); // Для отладки
    
    setProjectNotes(formattedNotes);
    setSelectedResources(formattedNotes.map(note => note.id));
    
  } catch (error) {
    console.error('Ошибка при загрузке ресурсов проекта:', error);
  } finally {
    setLoading(false);
  }
};

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleViewForm = (noteId) => {
    setModalMode('view');
    setSelectedNoteId(noteId);
    setShowFormModal(true);
  };

  const handleViewTemplateNote = async (noteId) => {
    try {
      const note = await noteApi.getNoteById(noteId);
      if (note.pattern_id !== 0) {
        // Если это заметка по шаблону
        const template = await patternApi.getById(note.pattern_id);
        setSelectedTemplate(template);
        setTemplateFormMode('view');
        setSelectedNoteId(noteId);
        setShowTemplateFormModal(true);
      } else {
        // Если стандартная анкета
        handleViewForm(noteId);
      }
    } catch (error) {
      console.error('Ошибка при загрузке заметки:', error);
    }
  };

  const handleEditForm = (noteId) => {
    setModalMode('edit');
    setSelectedNoteId(noteId);
    setShowFormModal(true);
  };

  const handleEditTemplateNote = async (noteId) => {
    try {
      const note = await noteApi.getNoteById(noteId);
      if (note.pattern_id !== 0) {
        const template = await patternApi.getById(note.pattern_id);
        setSelectedTemplate(template);
        setTemplateFormMode('edit');
        setSelectedNoteId(noteId);
        setShowTemplateFormModal(true);
      } else {
        handleEditForm(noteId);
      }
    } catch (error) {
      console.error('Ошибка при редактировании заметки:', error);
    }
  };

  const handleFormSuccess = () => {
    loadProjectResources();
  };

  const handleSwitchToEdit = (noteId) => {
    setModalMode('edit');
    setSelectedNoteId(noteId);
  };

  const handleSwitchToTemplateEdit = (noteId) => {
    setTemplateFormMode('edit');
  };

  const handleAddResourceClick = async () => {
  try {
    setLoading(true);
    const allNotes = await noteApi.getNotes();
    const freeNotesData = allNotes.filter(note => !note.project_id);
    
    console.log('Свободные заметки (сырые):', freeNotesData); // Для отладки
    
    const formattedFreeNotes = freeNotesData.map(item => {
      console.log('Свободная заметка ID:', item.id, 'pattern_id:', item.pattern_id); // Для отладки
      
      let dataObj = item.data;
      let displayName = 'Без названия';
      
      if (typeof dataObj === 'string') {
        try {
          dataObj = JSON.parse(dataObj);
        } catch (e) {
          dataObj = {};
        }
      }
      
      if (dataObj && typeof dataObj === 'object') {
        const values = Object.values(dataObj);
        if (values.length > 0) {
          displayName = String(values[0] || '');
        }
      }
      
      return {
        id: item.id,
        name: displayName,
        type: 'form',
        icon: '/personalcard.svg',
        selected: false,
        data: dataObj,
        project_id: item.project_id,
        pattern_id: item.pattern_id || 0 // Сохраняем pattern_id!
      };
    });
    
    console.log('Отформатированные свободные заметки:', formattedFreeNotes); // Для отладки
    
    setFreeNotes(formattedFreeNotes);
    setShowAddResourceModal(true);
    
  } catch (error) {
    console.error('Ошибка при загрузке свободных заметок:', error);
  } finally {
    setLoading(false);
  }
};

  const handleResourceSelect = (resourceId) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };

  const handleSaveResources = async () => {
    try {
      const newResources = selectedResources.filter(id => 
        !projectNotes.some(note => note.id === id)
      );
      const removedResources = projectNotes
        .filter(note => !selectedResources.includes(note.id))
        .map(note => note.id);
      
      // Добавляем новые ресурсы в проект
      for (const resourceId of newResources) {
        const note = freeNotes.find(n => n.id === resourceId);
        if (note) {
          await noteApi.update(resourceId, note.data, project.id);
        }
      }
      
      // Удаляем ресурсы из проекта
      for (const resourceId of removedResources) {
        const note = projectNotes.find(n => n.id === resourceId);
        if (note) {
          await noteApi.update(resourceId, note.data, null);
        }
      }
      
      await loadProjectResources();
      setShowAddResourceModal(false);
      
    } catch (error) {
      console.error('Ошибка при сохранении ресурсов:', error);
      alert('Ошибка при сохранении ресурсов');
    }
  };

  const handleCancelResources = () => {
    setShowAddResourceModal(false);
  };

  const handleRemoveResource = async (resourceId) => {
    try {
      const note = projectNotes.find(n => n.id === resourceId);
      if (note) {
        if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
          await noteApi.delete(resourceId);
          await loadProjectResources();
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Не удалось удалить анкету');
    }
  };

  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="project-page">
      {/* Верхняя плашка с лого */}
      <nav className="dashboard-nav">
        <button 
          className="nav-btn-circle"
          onClick={() => navigate('/dashboard')}
        >
          <img src="/home.svg" alt="Главная" className="nav-icon" />
        </button>
        
        <div className="nav-logo">
          <img src="/Logo.svg" alt="Логотип" className="logo" />
        </div>

        <button 
          className="nav-btn-circle"
          onClick={() => setShowUserModal(true)}
        >
          <img src="/cabinet.svg" alt="Личный кабинет" className="nav-icon" />
        </button>
      </nav>

      {/* Контент страницы проекта */}
      <div className="project-content">
        {/* Навигация назад и кнопка добавления */}
        <div className="project-header">
          <button 
            className="back-arrow"
            onClick={handleBackClick}
          >
            ←
          </button>
          
          <button
            className="btn btn-primary add-resource-centered"
            onClick={handleAddResourceClick}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'управление ресурсами'}
          </button>
        </div>

        {/* Название проекта */}
        <h1 className="project-title">{project.name}</h1>

        {/* Сетка добавленных ресурсов */}
        <div className="items-container">
          {projectNotes.map(resource => (
            <div 
              key={resource.id} 
              className="item-with-name"
              onClick={() => {
                if (resource.pattern_id && resource.pattern_id !== 0) {
                  handleViewTemplateNote(resource.id);
                } else {
                  handleViewForm(resource.id);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="item-card square-card">
                <div className="card-icon">
                  <img src={resource.icon} alt={resource.type} className="item-type-icon" />
                </div>
                
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveResource(resource.id);
                  }}
                >
                  <img src="/delete.svg" alt="Удалить" className="delete-icon" />
                </button>
              </div>
              <div className="item-name">
                {resource.name}
              </div>
            </div>
          ))}
          
          {projectNotes.length === 0 && (
            <div className="empty-state">
              <p>Добавьте ресурсы с помощью кнопки выше</p>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно добавления ресурсов */}
      {showAddResourceModal && (
        <div className="modal-overlay" onClick={handleCancelResources}>
          <div className="resource-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="resource-modal-title">выберете ресурс для добавления</h3>
              <button 
                className="modal-close"
                onClick={handleCancelResources}
              >
                ×
              </button>
            </div>
            
            <div className="resource-modal-content">
              {/* Секция свободных заметок */}
              {freeNotes.length > 0 && (
                <>
                  <h4 className="resource-section-title">Свободные заметки</h4>
                  <div className="resources-list">
                    {freeNotes.map(resource => (
                      <div 
                        key={resource.id} 
                        className={`resource-item ${selectedResources.includes(resource.id) ? 'selected' : ''}`}
                        onClick={() => handleResourceSelect(resource.id)}
                      >
                        <div className="resource-item-info">
                          <img src={resource.icon} alt={resource.type} className="resource-item-icon" />
                          <span className="resource-item-name">{resource.name}</span>
                        </div>
                        
                        <div className="resource-checkbox">
                          {selectedResources.includes(resource.id) && (
                            <div className="checkmark">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
             
              {projectNotes.length > 0 && (
                <>
                  <h4 className="resource-section-title">Заметки в проекте</h4>
                  <div className="resources-list">
                    {projectNotes.map(resource => (
                      <div 
                        key={resource.id} 
                        className={`resource-item selected`}
                        onClick={() => handleResourceSelect(resource.id)}
                      >
                        <div className="resource-item-info">
                          <img src={resource.icon} alt={resource.type} className="resource-item-icon" />
                          <span className="resource-item-name">{resource.name}</span>
                        </div>
                        
                        <div className="resource-checkbox">
                          {selectedResources.includes(resource.id) && (
                            <div className="checkmark">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {freeNotes.length === 0 && projectNotes.length === 0 && (
                <div className="empty-resources">
                  <p>Нет доступных ресурсов</p>
                </div>
              )}
            </div>
            
            <div className="modal-actions-single">
              <button 
                className="btn btn-primary"
                onClick={handleSaveResources}
              >
                СОХРАНИТЬ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно стандартной анкеты */}
      {showFormModal && (
        <FormModal
          showFormModal={showFormModal}
          setShowFormModal={setShowFormModal}
          mode={modalMode}
          noteId={selectedNoteId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowFormModal(false)}
          onSwitchToEdit={handleSwitchToEdit}
        />
      )}

      {/* Модальное окно заметки по шаблону */}
      {showTemplateFormModal && selectedTemplate && (
        <TemplateFormModal
          showFormModal={showTemplateFormModal}
          setShowFormModal={setShowTemplateFormModal}
          template={selectedTemplate}
          mode={templateFormMode}
          noteId={selectedNoteId}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowTemplateFormModal(false);
            setSelectedTemplate(null);
            setSelectedNoteId(null);
          }}
          onSwitchToEdit={handleSwitchToTemplateEdit}
        />
      )}

      {/* Модальное окно пользователя */}
      {showUserModal && (
        <UserModal
          showUserModal={showUserModal}
          setShowUserModal={setShowUserModal}
          userInitial={userInitial}
          userData={userData}
          handleUserDataChange={handleUserDataChange}
        />
      )}
    </div>
  );
};

export default ProjectPage;