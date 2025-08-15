import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getDemoShipments } from './utils/demoData';
import apiService from './services/api';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Check for existing token on app load
    const checkAuth = async () => {
      try {
        const response = await apiService.verifyToken();
        if (response.success) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        // Token invalid or expired, clear it
        apiService.logout();
        setCurrentUser(null);
      }
    };

    if (apiService.token && !currentUser) {
      checkAuth();
    }
  }, [currentUser]);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setCurrentUser(response.data.user);
        showToast('Login successful!', 'success');
        return true;
      } else {
        showToast(response.message || 'Login failed', 'error');
        return false;
      }
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        setCurrentUser(response.data.user);
        showToast('Account created successfully!', 'success');
        return true;
      } else {
        showToast(response.message || 'Registration failed', 'error');
        return false;
      }
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="app-container">
      {!currentUser ? (
        <LoginPage onLogin={login} onRegister={register} />
      ) : (
        <Dashboard 
          user={currentUser}
          onLogout={logout}
          showToast={showToast}
        />
      )}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <i className={`fas fa-${
              toast.type === 'success' ? 'check-circle' : 
              toast.type === 'error' ? 'exclamation-circle' : 
              'info-circle'
            }`}></i>
            <span>{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              style={{ 
                background: 'none', 
                border: 'none', 
                marginLeft: 'auto', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
