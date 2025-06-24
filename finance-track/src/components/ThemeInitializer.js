import React, { useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';

const ThemeInitializer = () => {
  const { preferences } = usePreferences();
  
  useEffect(() => {
    // Apply theme when app loads
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    document.documentElement.dataset.colorTheme = preferences.colorTheme;
  }, [preferences.theme, preferences.colorTheme]);
  
  return null; // This component doesn't render anything
};

export default ThemeInitializer;