import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProjectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  
  // Получаем данные проекта из location state или создаем заглушку
  const project = location.state?.project || { 
    id: 1, 
    name: 'Название проекта',
    description: 'Описание проекта'
  };

  // Заглушка для ресурсов (убраны карты связи)
  const availableResources = [
    { id: 1, name: 'Анкета клиента', type: 'form', icon: '/personalcard.svg', selected: false },
    { id: 2, name: 'Анкета сотрудника', type: 'form', icon: '/personalcard.svg', selected: false }
    // Убраны: Карта связей отдела и Внешние контакты
  ];

  // Состояния для формы пользователя
  const [userData, setUserData] = useState({
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Заполняем данные пользователя при открытии модалки
  useState(() => {
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

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleAddResourceClick = () => {
    setShowAddResourceModal(true);
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

  const handleSaveResources = () => {
    // Логика сохранения выбранных ресурсов
    console.log('Выбранные ресурсы:', selectedResources);
    setShowAddResourceModal(false);
    setSelectedResources([]);
  };

  const handleCancelResources = () => {
    setShowAddResourceModal(false);
    setSelectedResources([]);
  };

  const handleRemoveResource = (resourceId) => {
    setSelectedResources(prev => prev.filter(id => id !== resourceId));
  };

  // Обработчики для формы пользователя
  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUserData = () => {
    // Логика сохранения данных пользователя
    console.log('Сохранение данных:', userData);
    setShowUserModal(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      logout();
    }
  };

  // Получаем первую букву ника для аватарки
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  // Получаем выбранные ресурсы для отображения
  const selectedResourcesData = availableResources.filter(resource => 
    selectedResources.includes(resource.id)
  );

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
          >
            добавить ресурс
          </button>
        </div>

        {/* Название проекта */}
        <h1 className="project-title">{project.name}</h1>

        {/* Сетка добавленных ресурсов - такой же стиль как на главной */}
        <div className="items-container">
          {selectedResourcesData.map(resource => (
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
          
          {selectedResourcesData.length === 0 && (
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
              <div className="resources-list">
                {availableResources.map(resource => (
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