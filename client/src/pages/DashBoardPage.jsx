import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <div className="window">
        <h2 className="page-title">Личный кабинет</h2>
        <p className="dashboard-welcome">Добро пожаловать, {user?.username}!</p>
        <button 
          onClick={logout}
          className="btn btn-danger"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;