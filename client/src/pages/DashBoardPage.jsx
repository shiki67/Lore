import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../contexts/api';
import { noteApi } from '../contexts/NotesApi';
import UserModal from '../components/UserModal';
import FormModal from '../components/FormModal';
import { patternApi } from '../contexts/PatternApi';
import TemplatesModal from '../components/TemplatesModal';
import TemplateFormModal from '../components/TemplateFormModal';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectError, setProjectError] = useState('');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false); 
  const [showNoteTypeModal, setShowNoteTypeModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState('add');
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    birthDate: '',
    age: '',
    race: '',
    description: '',
    history: ''
  });
  const [modalMode, setModalMode] = useState('add');
  const [selectedNoteId, setSelectedNoteId] = useState(null);

    const handleViewForm = (noteId) => {
        setModalMode('view');
        setSelectedNoteId(noteId);
        setShowFormModal(true);
    };
    const handleEditForm = (noteId) => {
        setModalMode('edit');
        setSelectedNoteId(noteId);
        setShowFormModal(true);
    };
    const handleSwitchToEdit = (noteId) => {
    setModalMode('edit');
    setSelectedNoteId(noteId);
};



  const [userData, setUserData] = useState({
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
 useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projects = await apiService.getAllProjects();
      const formattedProjects = projects.map(project => ({
        id: project.id,
        type: 'project',
        name: project.name,
        description: project.description,
        icon: '/project.svg',
        color: '#29ABE2',
        createdAt: project.created_at || new Date().toISOString(),
      }));
      setActiveItems(formattedProjects);
    const allNotes = await noteApi.getNotes();
    const freeNotes = allNotes.filter(note => 
      !note.project_id || note.project_id === null || note.project_id === 0
    );
    const formattedFreeNotes = freeNotes.map(note => {
      let displayName = 'Без названия';
      let dataObj = note.data;
      if (typeof dataObj === 'string') {
        try {
          dataObj = JSON.parse(dataObj);
        } catch (e) {
          dataObj = {};
        }
      }
      if (dataObj && typeof dataObj === 'object') {
        const values = Object.values(dataObj);
        if (values.length > 0 && values[0]) {
          displayName = String(values[0]);
          if (displayName.length > 25) {
            displayName = displayName.substring(0, 25) + '...';
          }
        }
      }
      
      return {
        id: note.id,
        type: 'form',
        name: displayName,
        description: dataObj?.description || '',
        icon: '/personalcard.svg',
        color: '#4CAF50',
        createdAt: note.created_at || new Date().toISOString(),
        formData: dataObj,
        project_id: note.project_id,
        pattern_id: note.pattern_id || 0
      };
    });
    const allItems = [...formattedProjects, ...formattedFreeNotes];
    setActiveItems(allItems);
    
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
  }
};
  useEffect(() => {
  if (showUserModal) {
    if (user) {
      setUserData({
        nickname: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      fetchUserData();
    }
  }
}, [showUserModal, user]);
  const fetchUserData = async () => {
  try {
    const userDataFromApi = await apiService.get_user();
    setUserData(prev => ({
      ...prev,
      nickname: userDataFromApi.nickname || userDataFromApi.username || '',
      email: userDataFromApi.email || '',
    }));
  } catch (err) {
  } 
};
  const itemTypes = [
    { id: 'project', name: 'Проект', icon: '/project.svg', color: '#29ABE2' },
    { id: 'form', name: 'Анкета', icon: '/personalcard.svg', color: '#4CAF50' }
  ];
  const handleDelete = async (noteId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
            try {
                await noteApi.delete(noteId);
            } catch (error) {
                console.error('Ошибка при удалении:', error);
                setError('Не удалось удалить анкету');
            } finally {
                loadProjects();
            }
        }
    };
  const handleAddProject = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectError('');
    setShowProjectModal(true);
  };

  // const handleAddForm = () => {
  //   setFormData({
  //     fullName: '',
  //     shortName: '',
  //     birthDate: '',
  //     age: '',
  //     race: '',
  //     description: '',
  //     history: ''
  //   });
  //   setShowFormModal(true);
  // };
    const handleAddForm = () => {
        setModalMode('add');
        setSelectedNoteId(null);
        setShowFormModal(true);
        setFormData({
            fullName: '',
            shortName: '',
            birthDate: '',
            age: '',
            race: '',
            description: '',
            history: ''
        });
    };

  // const handleSaveForm = async () => {
  //   if (!formData.fullName.trim()) {
  //     alert('Поле "Полное имя" обязательно для заполнения');
  //     return;
  //   }
  //   await noteApi.addForm(formData);
  //   const newItem = {
  //     id: Date.now(),
  //     type: 'form',
  //     name: formData.shortName || formData.fullName,
  //     description: formData.description,
  //     icon: '/personalcard.svg',
  //     color: '#4CAF50',
  //     createdAt: new Date().toISOString(),
  //     formData: { ...formData }
  //   };
  
  //   setActiveItems([...activeItems, newItem]);
  //   setShowFormModal(false);
  // };
    const handleDeleteForm = async (noteId) => {
      if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
          await noteApi.delete(noteId);
          loadProjects();
          setShowFormModal(false);
      }
  };
      const handleFormSuccess = () => {
        loadProjects();
    };
    const handleSaveForm = async (noteId, formData) => {
        if (modalMode === 'add') {
            await noteApi.addForm(formData);
        } else if (modalMode === 'edit' && noteId) {
            await noteApi.update(noteId, formData);
        }
        loadProjects();
    };

  const handleCancelForm = () => {
    setShowFormModal(false);
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      setProjectError('Название проекта обязательно');
      return;
    }

    const resp = apiService.addProject(projectName, projectDescription)
    
    const newItem = {
      id: resp.project_id,
      type: 'project',
      name: projectName,
      description: projectDescription,
      icon: '/project.svg',
      color: '#29ABE2',
      
    };
    setActiveItems([...activeItems, newItem]);
    setShowProjectModal(false);
    loadProjects();
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
    apiService.deleteProject(id);
    setActiveItems(activeItems.filter(item => item.id !== id));
  };

  const handleProjectClick = (project) => {
    navigate('/project', { state: { project } });
  };

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


  const handleCreateTemplate = () => {
    console.log('Создание шаблона - функция в разработке');
  };
  const userInitial = userData?.nickname?.charAt(0)?.toUpperCase() || 'U';
  const formInitial = formData.fullName.charAt(0)?.toUpperCase() || 'A';
  const createNoteFromTemplate = (template) => {
    console.log('Создание заметки по шаблону:', template); // Для отладки
    console.log('ID шаблона:', template.id); // Для отладки
    
    // Убедитесь, что шаблон имеет ID
    if (!template.id || template.id === 0) {
      alert('Ошибка: неверный ID шаблона');
      return;
    }
    
    setSelectedTemplate(template);
    setTemplateFormMode('add');
    setShowTemplateFormModal(true);
  };
  const handleViewTemplateNote = async (noteId) => {
    try {
        // Загружаем заметку
        const note = await noteApi.getNoteById(noteId);
        if (note.pattern_id !== 0) {
            // Если это заметка по шаблону, загружаем шаблон
            const template = await patternApi.getById(note.pattern_id);
            setSelectedTemplate(template);
            setTemplateFormMode('view');
            setSelectedNoteId(noteId);
            setShowTemplateFormModal(true);
        } else {
            // Если стандартная анкета - используем FormModal
            handleViewForm(noteId);
        }
    } catch (error) {
        console.error('Ошибка при загрузке заметки:', error);
    }
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
          console.error('Ошибка при загрузке заметки:', error);
      }
  };

  const handleSwitchToTemplateEdit = (noteId) => {
      setTemplateFormMode('edit');
      // noteId уже установлен, просто меняем режим
  };
  return (
    <div className="dashboard-page">
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
            onClick={() => setShowTemplatesModal(true)}
          >
            шаблоны
          </button>
        </div>

        <div className="items-container">
            {activeItems.map(item => (
                <div 
                    key={`${item.type}-${item.id}`} 
                    className="item-with-name"
                    onClick={() => {
                        if (item.type === 'project') {
                            handleProjectClick(item);
                        } else if (item.type === 'form') {
                            handleViewTemplateNote(item.id);
                        }
                    }}
                    style={{ 
                        cursor: item.type === 'project' || item.type === 'form' ? 'pointer' : 'default' 
                    }}
                >
                    <div className="item-card square-card"
                            onClick={() => {
                                if (item.type === 'project') {
                                    handleProjectClick(item);
                                } else if (item.type === 'form') {
                                
                                    if (item.pattern_id && item.pattern_id !== 0) {
                                        
                                    } else {
                                        handleViewForm(item.id);
                                    }
                                }
                            }}>
                        <div className="card-icon">
                            <img src={item.icon} alt={item.type} className="item-type-icon" />
                            
                        </div>
                        <button 
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.type === 'form') {
                                handleDelete(item.id);
                              }
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
      {/* Модальное окно выбора типа заметки */}
      {showNoteTypeModal && (
        <div className="modal-overlay" onClick={() => setShowNoteTypeModal(false)}>
          <div className="user-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '400' }}>Создание заметки</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNoteTypeModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  className="black-outline-btn"
                  onClick={() => {
                    setShowNoteTypeModal(false);
                    handleAddForm(); // Стандартная анкета персонажа
                  }}
                  style={{ width: '100%', padding: '1rem' }}
                >
                  Персонаж (стандартная анкета)
                </button>
                
                <button 
                  className="black-outline-btn"
                  onClick={() => {
                    setShowNoteTypeModal(false);
                    setShowTemplatesModal(true);
                  }}
                  style={{ width: '100%', padding: '1rem' }}
                >
                  По шаблону
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Модальное окно выбора типа заметки */}
      {showNoteTypeModal && (
        <div className="modal-overlay" onClick={() => setShowNoteTypeModal(false)}>
          <div className="user-modal-wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '400' }}>Создание заметки</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNoteTypeModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  className="black-outline-btn"
                  onClick={() => {
                    setShowNoteTypeModal(false);
                    handleAddForm(); // Стандартная анкета персонажа
                  }}
                  style={{ width: '100%', padding: '1rem' }}
                >
                  Персонаж (стандартная анкета)
                </button>
                
                <button 
                  className="black-outline-btn"
                  onClick={() => {
                    setShowNoteTypeModal(false);
                    setShowTemplatesModal(true);
                  }}
                  style={{ width: '100%', padding: '1rem' }}
                >
                  По шаблону
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно шаблонов */}
      {showTemplatesModal && (
        <TemplatesModal
          showTemplatesModal={showTemplatesModal}
          setShowTemplatesModal={setShowTemplatesModal}
          onTemplateSelect={createNoteFromTemplate}
          mode="select"
        />
      )}

      {/* Модальное окно создания заметки по шаблону */}
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
      {showFormModal &&     <FormModal
              showFormModal={showFormModal}
              setShowFormModal={setShowFormModal}
              mode={modalMode}
              noteId={selectedNoteId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowFormModal(false)}
              onSwitchToEdit={handleSwitchToEdit}
    />}
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

export default DashboardPage;