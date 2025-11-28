import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectError, setProjectError] = useState('');

  // Состояния для формы анкеты
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    birthDate: '',
    age: '',
    race: '',
    description: '',
    history: ''
  });

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
    { id: 'form', name: 'Анкета', icon: '/personalcard.svg', color: '#4CAF50' }
  ];

  const handleAddProject = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectError('');
    setShowProjectModal(true);
  };

  const handleAddForm = () => {
    setFormData({
      fullName: '',
      shortName: '',
      birthDate: '',
      age: '',
      race: '',
      description: '',
      history: ''
    });
    setShowFormModal(true);
  };

  const handleSaveForm = () => {
    if (!formData.fullName.trim()) {
      alert('Поле "Полное имя" обязательно для заполнения');
      return;
    }

    const newItem = {
      id: Date.now(),
      type: 'form',
      name: formData.shortName || formData.fullName,
      description: formData.description,
      icon: '/personalcard.svg',
      color: '#4CAF50',
      createdAt: new Date().toISOString(),
      formData: { ...formData }
    };

    setActiveItems([...activeItems, newItem]);
    setShowFormModal(false);
  };

  const handleCancelForm = () => {
    setShowFormModal(false);
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
    if (type.id === 'form') {
      handleAddForm();
      return;
    }

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

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
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

  // Нефункциональная кнопка создания шаблона
  const handleCreateTemplate = () => {
    console.log('Создание шаблона - функция в разработке');
  };

  // Получаем первую букву ника для аватарки
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  // Получаем первую букву полного имени для иконки анкеты
  const formInitial = formData.fullName.charAt(0)?.toUpperCase() || 'A';

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
          
          {/* Нефункциональная кнопка создания шаблона */}
          <button
            className="creation-btn black-outline-btn"
            onClick={handleCreateTemplate}
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          >
            создать новый шаблон
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

      {/* Модальное окно создания анкеты */}
      {showFormModal && (
        <div className="modal-overlay" onClick={handleCancelForm} style={{ overflowY: 'auto', padding: '2rem 0' }}>
          <div className="user-modal-wide" onClick={(e) => e.stopPropagation()} style={{ 
            maxWidth: '900px', 
            width: '90vw', 
            margin: 'auto',
            position: 'relative'
          }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '400' }}>Создание анкеты</h3>
              <button 
                className="modal-close"
                onClick={handleCancelForm}
              >
                ×
              </button>
            </div>
            
            <div className="user-profile" style={{ padding: '1.5rem' }}>
              {/* 1 сектор - составной */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                {/* Иконка слева */}
                <div className="user-avatar-outline" style={{ width: '80px', height: '80px', flexShrink: 0, marginTop: '0.5rem' }}>
                  {formInitial}
                </div>
                
                {/* Правая часть - три поля ввода */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
                  {/* Полное имя */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ width: '140px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', flexShrink: 0 }}>
                      Полное имя
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.fullName}
                      onChange={(e) => handleFormDataChange('fullName', e.target.value)}
                      placeholder="Введите полное имя"
                      style={{ flex: 1 }}
                    />
                  </div>
                  
                  {/* Сокращенное имя */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ width: '140px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', flexShrink: 0 }}>
                      Сокращенное имя
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.shortName}
                      onChange={(e) => handleFormDataChange('shortName', e.target.value)}
                      placeholder="Введите сокращенное имя"
                      style={{ flex: 1 }}
                    />
                  </div>
                  
                  {/* Три поля ввода - выровнены с полями имен */}
                  <div style={{ display: 'flex', gap: '1rem', marginLeft: '56px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ width: '90px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', flexShrink: 0 }}>
                        Дата рождения
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={formData.birthDate}
                        onChange={(e) => handleFormDataChange('birthDate', e.target.value)}
                        placeholder="дд.мм.гггг"
                        style={{ flex: 1 }}
                      />
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ width: '60px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', flexShrink: 0 }}>
                        Возраст
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={formData.age}
                        onChange={(e) => handleFormDataChange('age', e.target.value)}
                        placeholder="Возраст"
                        style={{ flex: 1 }}
                      />
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ width: '40px', textAlign: 'right', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', flexShrink: 0 }}>
                        Раса
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={formData.race}
                        onChange={(e) => handleFormDataChange('race', e.target.value)}
                        placeholder="Раса"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 2 сектор - описание */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Описание
                </label>
                <textarea
                  className="input textarea"
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  placeholder="Введите описание"
                  rows="3"
                  style={{ width: '100%' }}
                />
              </div>
              
              {/* 3 сектор - история */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  История
                </label>
                <textarea
                  className="input textarea"
                  value={formData.history}
                  onChange={(e) => handleFormDataChange('history', e.target.value)}
                  placeholder="Введите историю"
                  rows="3"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div className="modal-actions-single" style={{ justifyContent: 'flex-end', padding: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSaveForm}
                style={{ minWidth: '140px' }}
              >
                СОХРАНИТЬ
              </button>
            </div>
          </div>
        </div>
      )}

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

export default DashboardPage;