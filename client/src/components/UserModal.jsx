
const UserModal = (props) => {
    const handleLogout = () => {
        apiService.logout();
        navigate('/login');
    };
    if (!props.showUserModal) return null;
    return(
        <div className="modal-overlay" onClick={() => props.setShowUserModal(false)}>
          <div className="user-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="modal-close"
                onClick={() => props.setShowUserModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar-large">
                {props.userInitial}
              </div>
              
              <div className="user-form">
                <div className="form-row">
                  <label className="form-label">Никнейм</label>
                  <input
                    type="text"
                    className="form-input-wide"
                    value={props.userData.nickname}
                    onChange={(e) => props.handleUserDataChange('nickname', e.target.value)}
                    placeholder="Введите никнейм"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">Почта</label>
                  <input
                    type="email"
                    className="form-input-wide"
                    value={props.userData.email}
                    onChange={(e) => props.handleUserDataChange('email', e.target.value)}
                    placeholder="Введите email"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions-double-wide">
              <button 
                className="btn btn-primary"
                onClick={handleLogout}
              >
                ВЫЙТИ ИЗ АККАУНТА
              </button>
            </div>
          </div>
        </div>
      )
}

export default UserModal;