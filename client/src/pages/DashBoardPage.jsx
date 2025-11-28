import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectError, setProjectError] = useState('');

  // Состояния для формы пользователя
  const [userData, setUserData] = useState({
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Заполняем данные пользователя при открытии модалки
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

  const itemTypes = [
    { id: 'project', name: 'Проект', icon: '/project.svg', color: '#29ABE2' },
    { id: 'form', name: 'Анкета', icon: '/personalcard.svg', color: '#4CAF50' },
    { id: 'contact', name: 'Связь', icon: '/connection.svg', color: '#FF9800' }
  ];

  const handleAddProject = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectError('');
    setShowProjectModal(true);
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      setProjectError('Название проекта обязательно');
      return;
    }

    const newItem = {
      id: Date.now(),
      type: 'project',
      name: projectName,
      description: projectDescription,
      icon: '/project.svg',
      color: '#29ABE2',
      createdAt: new Date().toISOString()
    };

    setActiveItems([...activeItems, newItem]);
    setShowProjectModal(false);
    
    // Навигация на страницу проекта
    navigate('/project', { state: { project: newItem } });
  };

  const handleCancelProject = () => {
    setShowProjectModal(false);
    setProjectName('');
    setProjectDescription('');
    setProjectError('');
  };

  const handleAddItem = (type) => {
    const newItem = {
      id: Date.now(),
      type: type.id,
      name: `${type.name} ${activeItems.filter(item => item.type === type.id).length + 1}`,
      icon: type.icon,
      color: type.color,
      createdAt: new Date().toISOString()
    };
    setActiveItems([...activeItems, newItem]);
  };

  const handleRemoveItem = (id) => {
    setActiveItems(activeItems.filter(item => item.id !== id));
  };

  const handleProjectClick = (project) => {
    navigate('/project', { state: { project } });
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

  return (
    <div className="dashboard-page">
      {/* Верхняя плашка с лого */}
      <nav className="dashboard-nav">
        <button 
          className="nav-btn-circle"
          onClick={() => window.location.reload()}
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

      {/* Основной контент */}
      <div className="dashboard-content">
        {/* Заголовок */}
        <h2 className="world-title">создай свой мир</h2>
        
        {/* Кнопки создания */}
        <div className="creation-buttons">
          <button
            className="creation-btn black-outline-btn"
            onClick={handleAddProject}
          >
            создать проект
          </button>
          
          <button
            className="creation-btn black-outline-btn"
            onClick={() => handleAddItem(itemTypes[1])}
          >
            создать анкету
          </button>
          
          <button
            className="creation-btn black-outline-btn"
            onClick={() => handleAddItem(itemTypes[2])}
          >
            создать карту связи
          </button>
        </div>

        {/* Общая сетка для карточек и подписей */}
        <div className="items-container">
          {activeItems.map(item => (
            <div 
              key={item.id} 
              className="item-with-name"
              onClick={() => item.type === 'project' && handleProjectClick(item)}
              style={{ cursor: item.type === 'project' ? 'pointer' : 'default' }}
            >
              <div className="item-card square-card">
                <div className="card-icon">
                  <img src={item.icon} alt={item.type} className="item-type-icon" />
                </div>
                
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.id);
                  }}
                >
                  <img src="/delete.svg" alt="Удалить" className="delete-icon" />
                </button>
                
                {item.description && (
                  <div className="item-description">
                    {item.description}
                  </div>
                )}
              </div>
              <div className="item-name">
                {item.name}
              </div>
            </div>
          ))}
          
          {activeItems.length === 0 && (
            <div className="empty-state">
              <p>Начните создавать элементы с помощью кнопок выше</p>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания проекта */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={handleCancelProject}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="modal-close"
                onClick={handleCancelProject}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {projectError && (
                <div className="error-message">{projectError}</div>
              )}
              
              <div className="input-group">
                <label className="input-label">Название проекта*</label>
                <input
                  type="text"
                  className="input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Введите название проекта"
                  required
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Описание проекта</label>
                <textarea
                  className="input textarea"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Введите описание проекта (необязательно)"
                  rows="4"
                />
              </div>
            </div>
            
            <div className="modal-actions-single">
              <button 
                className="btn btn-primary"
                onClick={handleSaveProject}
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
              <div className="user-avatar-outline">
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

export default DashboardPage;