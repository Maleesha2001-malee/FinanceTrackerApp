import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';

function NotificationsTab() {
  const { preferences, updateNotificationPreference, savePreferences } = usePreferences();
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationChange = (key, value) => {
    updateNotificationPreference(key, value);
  };

  const handleSaveNotifications = () => {
    setIsSaving(true);
    
    // Simulate API call to save preferences
    setTimeout(() => {
      const success = savePreferences();
      if (success) {
        setStatusMessage({
          type: 'success',
          text: 'Notification preferences saved successfully!'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to save notification preferences. Please try again.'
        });
      }
      setIsSaving(false);
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    }, 600); // Simulate API delay
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className={`p-3 rounded-md ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about account activity</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.notifications.emailNotifications} 
              className="sr-only peer" 
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Alerts</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you're approaching budget limits</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.notifications.budgetAlerts} 
              className="sr-only peer" 
              onChange={(e) => handleNotificationChange('budgetAlerts', e.target.checked)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Progress</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates on your financial goals</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.notifications.goalProgress} 
              className="sr-only peer" 
              onChange={(e) => handleNotificationChange('goalProgress', e.target.checked)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Summary</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get weekly reports of your financial activity</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.notifications.weeklySummary} 
              className="sr-only peer" 
              onChange={(e) => handleNotificationChange('weeklySummary', e.target.checked)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSaveNotifications}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white ${
            isSaving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
        >
          {isSaving ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </div>
  );
}

export default NotificationsTab;