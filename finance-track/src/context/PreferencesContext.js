import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Create the context
export const PreferencesContext = createContext();

// Create the provider component
export const PreferencesProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    currency: 'USD ($)',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    colorTheme: 'blue',
    notifications: {
      emailNotifications: true,
      budgetAlerts: true,
      goalProgress: true,
      weeklySummary: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create axios instance with auth token
  const getAxiosInstance = () => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => {
      const newPrefs = {
        ...prev,
        [key]: value
      };
      
      // If theme or colorTheme is changing, apply it immediately
      if (key === 'theme' || key === 'colorTheme') {
        applyThemeChanges(
          key === 'theme' ? value : prev.theme,
          key === 'colorTheme' ? value : prev.colorTheme
        );
      }
      
      return newPrefs;
    });
  };

  // Fetch preferences when user is logged in
  useEffect(() => {
    if (currentUser) {
      fetchPreferences();
      
      // Apply theme immediately after login
      applyThemeChanges(preferences.theme, preferences.colorTheme);
    }
  }, [currentUser]);

 // Function to apply theme changes to the document
const applyThemeChanges = (theme, colorTheme) => {
  // Apply dark/light theme using Tailwind's dark class
  document.documentElement.classList.toggle('dark', theme === 'dark');
  
  // Apply color theme
  document.documentElement.dataset.colorTheme = colorTheme;
};
  // Fetch user preferences
  const fetchPreferences = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.get('/api/users/preferences');
      
      if (response.data) {
        // Update preferences state
        const updatedPreferences = {
          currency: response.data.currency || preferences.currency,
          dateFormat: response.data.dateFormat || preferences.dateFormat,
          theme: response.data.theme || preferences.theme,
          colorTheme: response.data.colorTheme || preferences.colorTheme,
          notifications: {
            emailNotifications: response.data.notificationSettings?.emailNotifications ?? preferences.notifications.emailNotifications,
            budgetAlerts: response.data.notificationSettings?.budgetAlerts ?? preferences.notifications.budgetAlerts,
            goalProgress: response.data.notificationSettings?.goalProgress ?? preferences.notifications.goalProgress,
            weeklySummary: response.data.notificationSettings?.weeklySummary ?? preferences.notifications.weeklySummary
          }
        };
        
        setPreferences(updatedPreferences);
        
        // Apply theme changes
        applyThemeChanges(updatedPreferences.theme, updatedPreferences.colorTheme);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
      setLoading(false);
    }
  };

  const updateNotificationPreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  // Save preferences to the backend
  const savePreferences = async () => {
    if (!currentUser) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const axiosInstance = getAxiosInstance();
      
      // Save general preferences
      const prefsResponse = await axiosInstance.put('/api/users/preferences', {
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
        theme: preferences.theme,
        colorTheme: preferences.colorTheme
      });
      
      // Save notification settings
      const notifResponse = await axiosInstance.put('/api/users/notifications', {
        emailNotifications: preferences.notifications.emailNotifications,
        budgetAlerts: preferences.notifications.budgetAlerts,
        goalProgress: preferences.notifications.goalProgress,
        weeklySummary: preferences.notifications.weeklySummary
      });
      
      // Apply theme changes immediately
      applyThemeChanges(preferences.theme, preferences.colorTheme);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
      setLoading(false);
      return false;
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        error,
        updatePreference,
        updateNotificationPreference,
        savePreferences,
        fetchPreferences,
        applyThemeChanges
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

// Custom hook to use the PreferencesContext
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};