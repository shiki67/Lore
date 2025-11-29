import { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
import {useNavigate, Link } from 'react-router-dom';
import { apiService } from '../api';
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await apiService.auth(username, password);
    if (!result.success) {
      setError(result.error);
    }
    if (result.access_token) {
        navigate('/dashboard');
      } 
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src="/Logo.svg" alt="Логотип" className="logo" />
      </div>
      
      <div className="window">
        <h2 className="page-title">Вход</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label className="input-label">Логин (почта/телефон)*</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Введите пароль*</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Вход...' : 'ВОЙТИ'}
          </button>
        </form>
        
        <div className="link">
          <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;