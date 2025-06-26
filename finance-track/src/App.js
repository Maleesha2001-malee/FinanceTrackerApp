import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Transactions from './components/transactions/Transactions';
import Goals from './components/goal/Goals';
import Budget from './components/dashboard/Budget'; 
import Reports from './components/reports/Reports'; 
import Settings from './components/settings/Settings'; 
import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/layout/Navbar';
import WelcomePage from './components/layout/WelcomePage';
import AuthProvider from './context/AuthContext';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import ThemeInitializer from './components/ThemeInitializer';


function ThemeManager({ children }) {
  const { preferences } = usePreferences();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    
    document.documentElement.dataset.colorTheme = preferences.colorTheme;
  }, [preferences.theme, preferences.colorTheme]);

  return children;
}
function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <ThemeManager>
          <Router>
            <div className="min-h-screen bg-blue-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
              {/* Only show navbar on non-welcome pages */}
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="*" element={<Navbar />} />
              </Routes>
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/transactions" 
                  element={
                    <PrivateRoute>
                      <Transactions />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/goals" 
                  element={
                    <PrivateRoute>
                      <Goals />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/budgets" 
                  element={
                    <PrivateRoute>
                      <Budget />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </ThemeManager>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
