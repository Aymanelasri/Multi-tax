import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const getThemeKey = (userId) => userId ? `theme_${userId}` : null;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [userId, setUserId] = useState(null);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Called by AuthContext after login — loads user's saved theme
  const initThemeForUser = (uid) => {
    setUserId(uid);
    const key = getThemeKey(uid);
    const saved = key ? localStorage.getItem(key) : null;
    setTheme(saved === 'light' ? 'light' : 'dark');
  };

  // Called by AuthContext on logout — reset to dark without touching user prefs
  const resetTheme = () => {
    setUserId(null);
    setTheme('dark');
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const key = getThemeKey(userId);
      if (key) localStorage.setItem(key, next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, initThemeForUser, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};