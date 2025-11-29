import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { apiService } from '../api';
const RegisterPage = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (password.length < 3) {
      setError('Пароль должен быть не менее 3 символов');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('Необходимо согласие на обработку персональных данных');
      setLoading(false);
      return;
    }

    const result = await apiService.registration(nickname, email, password);
    
    // if (!result.success) {
    //   setError(result.error);
    // }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src="/Logo.svg" alt="Логотип" className="logo" />
      </div>
      
      <div className="window">
        <h2 className="page-title">Регистрация</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label className="input-label">Имя пользователя*</label>
            <input
              type="text"
              className="input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Логин(почта/телефон)*</label>
            <input
              type="text"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Придумайте пароль*</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Повторите пароль*</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="checkbox"
              />
              <span className="checkbox-text">
                Я согласен на обработку персональных данных*
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Регистрация...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
          </button>
        </form>
        
        <div className="link">
          <Link to="/login">Уже есть аккаунт?</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;