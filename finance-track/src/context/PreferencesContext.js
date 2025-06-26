import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';


export const PreferencesContext = createContext();


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
      
      
      if (key === 'theme' || key === 'colorTheme') {
        applyThemeChanges(
          key === 'theme' ? value : prev.theme,
          key === 'colorTheme' ? value : prev.colorTheme
        );
      }
      
      return newPrefs;
    });
  };

 
  useEffect(() => {
    if (currentUser) {
      fetchPreferences();
      
    
      applyThemeChanges(preferences.theme, preferences.colorTheme);
    }
  }, [currentUser]);


const applyThemeChanges = (theme, colorTheme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.colorTheme = colorTheme;
};
  
  const fetchPreferences = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.get('/api/users/preferences');
      
      if (response.data) {
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

  
  const savePreferences = async () => {
    if (!currentUser) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const axiosInstance = getAxiosInstance();
      
     
      const prefsResponse = await axiosInstance.put('/api/users/preferences', {
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
        theme: preferences.theme,
        colorTheme: preferences.colorTheme
      });
      
     
      const notifResponse = await axiosInstance.put('/api/users/notifications', {
        emailNotifications: preferences.notifications.emailNotifications,
        budgetAlerts: preferences.notifications.budgetAlerts,
        goalProgress: preferences.notifications.goalProgress,
        weeklySummary: preferences.notifications.weeklySummary
      });
      
     
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


export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
