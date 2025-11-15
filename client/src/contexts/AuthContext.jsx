import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, username, password) => {
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (existingUsers.find(u => u.username === username)) {
      return { success: false, error: 'Пользователь уже существует' };
    }

    const newUser = {
      id: Date.now(),
      name, 
      username,
      password,
      createdAt: new Date().toISOString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    localStorage.setItem('currentUser', JSON.stringify({ name, username }));
    setUser({ name, username });

    return { success: true };
  };

  const login = async (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return { success: false, error: 'Неверный логин или пароль' };
    }

    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, username }));
    setUser({ name: user.name, username });

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};