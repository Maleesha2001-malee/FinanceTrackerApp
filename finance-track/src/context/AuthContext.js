import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in (token exists)
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      
      // Set default headers for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setCurrentUser(response.data.user);
      setError(null);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', userData);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    setCurrentUser(null);
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/auth/check-username?username=${encodeURIComponent(username)}`);
      return !response.data.exists;
    } catch (err) {
      console.error('Error checking username availability:', err);
      return false;
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/auth/check-email?email=${encodeURIComponent(email)}`);
      return !response.data.exists;
    } catch (err) {
      console.error('Error checking email availability:', err);
      return false;
    }
  };

  
  
  

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        checkUsernameAvailability,
        checkEmailAvailability
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;