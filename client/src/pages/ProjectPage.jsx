import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { noteApi } from '../contexts/NotesApi';

const ProjectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [projectNotes, setProjectNotes] = useState([])
  const [freeNotes, setFreeNotes] = useState([]);
  const [loading, setLoading] = useState(false);
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
      
      const formattedNotes = notesInProject.map(item => {
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
          project_id: item.project_id
        };
      });
      
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

  const handleAddResourceClick = async () => {
    try {
      setLoading(true);
      const allNotes = await noteApi.getNotes();
      const freeNotesData = allNotes.filter(note => 
        !note.project_id
      );
      
      const formattedFreeNotes = freeNotesData.map(item => {
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
          project_id: item.project_id
        };
      });
      
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
      for (const resourceId of newResources) {
        const note = freeNotes.find(n => n.id === resourceId);
        if (note) {
          await noteApi.update(resourceId, note.data, project.id);
        }
      }
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
        await noteApi.update(resourceId, note.data, null);
        await loadProjectResources();
      }
    } catch (error) {
      console.error('Ошибка при удалении ресурса:', error);
    }
  };
  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUserData = () => {
    console.log('Сохранение данных:', userData);
    setShowUserModal(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      logout();
    }
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
            <div key={resource.id} className="item-with-name">
              <div className="item-card square-card">
                <div className="card-icon">
                  <img src={resource.icon} alt={resource.type} className="item-type-icon" />
                </div>
                
                <button 
                  className="delete-btn"
                  onClick={() => handleRemoveResource(resource.id)}
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
              
              {/* Секция заметок уже в проекте */}
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

      {/* Модальное окно пользователя */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="user-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar-large">
                {userInitial}
              </div>
              
              <div className="user-form">
                <div className="form-row">
                  <label className="form-label">Никнейм</label>
                  <input
                    type="text"
                    className="form-input-wide"
                    value={userData.nickname}
                    onChange={(e) => handleUserDataChange('nickname', e.target.value)}
                    placeholder="Введите никнейм"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">Почта</label>
                  <input
                    type="email"
                    className="form-input-wide"
                    value={userData.email}
                    onChange={(e) => handleUserDataChange('email', e.target.value)}
                    placeholder="Введите email"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">Телефон</label>
                  <input
                    type="tel"
                    className="form-input-wide"
                    value={userData.phone}
                    onChange={(e) => handleUserDataChange('phone', e.target.value)}
                    placeholder="Введите телефон"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">Пароль</label>
                  <input
                    type="password"
                    className="form-input-wide"
                    value={userData.password}
                    onChange={(e) => handleUserDataChange('password', e.target.value)}
                    placeholder="Введите новый пароль"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">Повторите пароль</label>
                  <input
                    type="password"
                    className="form-input-wide"
                    value={userData.confirmPassword}
                    onChange={(e) => handleUserDataChange('confirmPassword', e.target.value)}
                    placeholder="Повторите пароль"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions-double-wide">
              <button 
                className="btn btn-primary"
                onClick={handleDeleteAccount}
              >
                УДАЛИТЬ АККАУНТ
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveUserData}
              >
                СОХРАНИТЬ ИЗМЕНЕНИЯ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;