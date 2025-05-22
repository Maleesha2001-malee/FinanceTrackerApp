import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';

function PreferencesTab() {
  const { preferences, updatePreference, savePreferences } = usePreferences();
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);


  const handlePreferenceChange = (key, value) => {
    updatePreference(key, value);
    
    // For immediate visual feedback
    if (key === 'theme') {
      document.documentElement.classList.toggle('dark', value === 'dark');
    }
    
    if (key === 'colorTheme') {
      document.documentElement.dataset.colorTheme = value;
    }
  };
  const handleSavePreferences = () => {
    setIsSaving(true);
    
    // Simulate API call to save preferences
    setTimeout(() => {
      const success = savePreferences();
      if (success) {
        setStatusMessage({
          type: 'success',
          text: 'Preferences saved successfully!'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to save preferences. Please try again.'
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Account Settings</h3>
          
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="JPY (¥)">JPY (¥)</option>
                <option value="CAD (C$)">CAD (C$)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Format
            </label>
            <div className="relative">
              <select
                id="dateFormat"
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Theme</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Appearance
            </label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-md ${
                  preferences.theme === 'light'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handlePreferenceChange('theme', 'light')}
              >
                Light
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md ${
                  preferences.theme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handlePreferenceChange('theme', 'dark')}
              >
                Dark
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Theme
            </label>
            <div className="flex space-x-3">
              {[
                { name: 'blue', class: 'bg-blue-500' },
                { name: 'green', class: 'bg-green-500' },
                { name: 'orange', class: 'bg-orange-500' },
                { name: 'red', class: 'bg-red-500' },
                { name: 'purple', class: 'bg-purple-500' }
              ].map(colorObj => (
                <button
                  key={colorObj.name}
                  className={`h-8 w-8 rounded-full ${colorObj.class} ${
                    preferences.colorTheme === colorObj.name ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  onClick={() => handlePreferenceChange('colorTheme', colorObj.name)}
                  aria-label={`${colorObj.name} theme`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white ${
            isSaving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

export default PreferencesTab;