// Settings.jsx - Main component file
import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

// Import sub-components
import ProfileTab from './ProfileTab';
import PreferencesTab from './PreferencesTab';
import NotificationsTab from './NotificationsTab';
import SecurityTab from './SecurityTab';
import TabNavigation from './TabNavigation';
import StatusMessage from './StatusMessage';

function Settings() {
  const { currentUser } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    username: ''
  });
  
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
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Create axios instance with auth token
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [currentUser]);
  
  // Function to apply theme changes to the document
  const applyThemeChanges = (theme, colorTheme) => {
    console.log('Applying theme changes:', theme, colorTheme);
    
    // Apply theme
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(theme + '-theme');
    
    // Apply color theme
    document.documentElement.dataset.colorTheme = colorTheme;
  };
  
  // Fetch user data function
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Instead of just using currentUser from context, fetch the full user profile
      const userProfileResponse = await axiosInstance.get('/api/users/profile');
      
      if (userProfileResponse.data) {
        setUserInfo({
          fullName: userProfileResponse.data.fullName || '',
          email: userProfileResponse.data.email || '',
          username: userProfileResponse.data.username || ''
        });
      }
      // Fetch user preferences
      const prefsResponse = await axiosInstance.get('/api/users/preferences');
      if (prefsResponse.data) {
        // Merge with defaults to ensure we have all properties
        const newPrefs = {
          ...preferences,
          currency: prefsResponse.data.currency || preferences.currency,
          dateFormat: prefsResponse.data.dateFormat || preferences.dateFormat,
          theme: prefsResponse.data.theme || preferences.theme,
          colorTheme: prefsResponse.data.colorTheme || preferences.colorTheme,
          // Extract notification settings from the preferences response
          notifications: {
            emailNotifications: prefsResponse.data.notificationSettings?.emailNotifications ?? preferences.notifications.emailNotifications,
            budgetAlerts: prefsResponse.data.notificationSettings?.budgetAlerts ?? preferences.notifications.budgetAlerts,
            goalProgress: prefsResponse.data.notificationSettings?.goalProgress ?? preferences.notifications.goalProgress,
            weeklySummary: prefsResponse.data.notificationSettings?.weeklySummary ?? preferences.notifications.weeklySummary
          }
        };
        
        setPreferences(newPrefs);
        
        // Apply theme after fetching preferences
        applyThemeChanges(newPrefs.theme, newPrefs.colorTheme);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      setMessage({
        type: 'error',
        text: 'Failed to load user settings. Please try again.'
      });
      
      // Clear error message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handler for user info changes
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };
  
  // Handler for preference changes
  const handlePreferenceChange = (key, value) => {
    setPreferences(prevPrefs => ({
      ...prevPrefs,
      [key]: value
    }));
  };
  
  // Handler for notification changes
  const handleNotificationChange = (key, value) => {
    setPreferences(prevPrefs => ({
      ...prevPrefs,
      notifications: {
        ...prevPrefs.notifications,
        [key]: value
      }
    }));
  };
  
  // Handler for password changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Save changes function
  const saveChanges = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Save user information
      if (activeTab === 'profile') {
        console.log('Saving profile data:', userInfo);
        const response = await axiosInstance.put('/api/users/profile', {
          fullName: userInfo.fullName,
          email: userInfo.email
        });
        
        console.log('Profile save response:', response);
        setMessage({ type: 'success', text: response.data.message || 'Profile updated successfully' });
      }
      
      // Save user preferences
      else if (activeTab === 'preferences') {
        console.log('Saving preferences data:', preferences);
        const prefsResponse = await axiosInstance.put('/api/users/preferences', {
          currency: preferences.currency,
          dateFormat: preferences.dateFormat,
          theme: preferences.theme,
          colorTheme: preferences.colorTheme
        });
        
        console.log('Preferences save response:', prefsResponse);
        
        // Apply theme changes immediately after successful update
        if (prefsResponse.data) {
          // Directly apply theme changes after save
          applyThemeChanges(preferences.theme, preferences.colorTheme);
        }
        
        setMessage({ type: 'success', text: prefsResponse.data.message || 'Preferences updated successfully' });
      }
      
      // Save notification preferences
      else if (activeTab === 'notifications') {
        console.log('Saving notification data:', preferences.notifications);
        const notifResponse = await axiosInstance.put('/api/users/notifications', {
          emailNotifications: preferences.notifications.emailNotifications,
          budgetAlerts: preferences.notifications.budgetAlerts,
          goalProgress: preferences.notifications.goalProgress,
          weeklySummary: preferences.notifications.weeklySummary
        });
        
        console.log('Notifications save response:', notifResponse);
        setMessage({ type: 'success', text: notifResponse.data.message || 'Notification settings updated successfully' });
      }
      
      setLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save settings' 
      });
    }
  };

  const updatePassword = async () => {
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await axiosInstance.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setLoading(false);
      setMessage({ type: 'success', text: response.data.message || 'Password updated successfully' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password' 
      });
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    // Confirm deletion with user
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await axiosInstance.delete('/api/users/delete-account');
      
      setLoading(false);
      setMessage({ type: 'success', text: response.data.message || 'Account deleted successfully' });
      
      // Redirect to logout or login page after successful deletion
      setTimeout(() => {
        // Assuming you have a logout function in AuthContext
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete account' 
      });
    }
  };
  
  // Apply theme and color theme effect when preferences change
  useEffect(() => {
    applyThemeChanges(preferences.theme, preferences.colorTheme);
  }, [preferences.theme, preferences.colorTheme]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Profile & Settings</h2>
          {activeTab === 'profile' && (
            <button
              onClick={saveChanges}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        
        {message && <StatusMessage message={message} />}
        
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab 
              userInfo={userInfo} 
              handleUserInfoChange={handleUserInfoChange} 
            />
          )}
          
          {activeTab === 'preferences' && (
            <PreferencesTab 
              preferences={preferences} 
              handlePreferenceChange={handlePreferenceChange} 
            />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsTab 
              preferences={preferences} 
              handleNotificationChange={handleNotificationChange} 
            />
          )}
          
          {activeTab === 'security' && (
            <SecurityTab 
              passwordData={passwordData}
              handlePasswordChange={handlePasswordChange}
              updatePassword={updatePassword}
              deleteAccount={deleteAccount}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;