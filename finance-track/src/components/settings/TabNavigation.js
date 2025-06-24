import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';

function TabNavigation({ activeTab, setActiveTab }) {
  // Access the preferences to get the current theme's primary color
  const { preferences } = usePreferences();
  
  // Dynamic class for active tab based on color theme
  const getActiveTabClass = () => {
    switch(preferences.colorTheme) {
      case 'green':
        return 'text-green-600 border-b-2 border-green-500';
      case 'orange':
        return 'text-orange-600 border-b-2 border-orange-500';
      case 'red':
        return 'text-red-600 border-b-2 border-red-500';
      case 'purple':
        return 'text-purple-600 border-b-2 border-purple-500';
      case 'blue':
      default:
        return 'text-blue-600 border-b-2 border-blue-500';
    }
  };

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex-1 py-4 px-6 text-center font-medium ${
          activeTab === 'profile'
            ? getActiveTabClass()
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Profile
      </button>
      <button
        onClick={() => setActiveTab('preferences')}
        className={`flex-1 py-4 px-6 text-center font-medium ${
          activeTab === 'preferences'
            ? getActiveTabClass()
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Preferences
      </button>
      <button
        onClick={() => setActiveTab('notifications')}
        className={`flex-1 py-4 px-6 text-center font-medium ${
          activeTab === 'notifications'
            ? getActiveTabClass()
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Notifications
      </button>
      <button
        onClick={() => setActiveTab('security')}
        className={`flex-1 py-4 px-6 text-center font-medium ${
          activeTab === 'security'
            ? getActiveTabClass()
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Security
      </button>
    </div>
  );
}

export default TabNavigation;