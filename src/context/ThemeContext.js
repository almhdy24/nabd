import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors as LightColors } from '../theme/colors';
import { Colors as DarkColors } from '../theme/darkColors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState(LightColors);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(mode => {
      const dark = mode === 'dark';
      setIsDark(dark);
      setColors(dark ? DarkColors : LightColors);
    });
  }, []);

  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark);
    setColors(newDark ? DarkColors : LightColors);
    await AsyncStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
