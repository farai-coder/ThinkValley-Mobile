import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const colors = {
    primary: '#F47A20',
    primaryDark: '#D2620F',
    primaryLight: '#FFA055',
    secondary: '#f5f6f8',
    accent: '#fbbf24',
    textPrimary: '#1e1e1e',
    textSecondary: '#5a5a5a',
    textMuted: '#8a8a8a',
    textHint: '#b0b0b0',
    borderColor: '#e4e7ec',
    cardBg: '#ffffff',
    background: isDark ? '#1a1a1a' : '#ffffff',
    surface: isDark ? '#2a2a2a' : '#f8f9fa',
    surfaceVariant: isDark ? '#333333' : '#f0f1f3',
    error: '#e53238',
    errorLight: '#ff6b6b',
    success: '#86b817',
    successLight: '#a3d648',
    warning: '#f5af02',
    warningLight: '#ffc107',
    info: '#0064d2',
    infoLight: '#4da3ff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    onPrimary: '#ffffff',
    onSurface: '#1e1e1e',
    onBackground: '#1e1e1e',
    divider: '#e0e0e0',
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  };

  const borderRadius = {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 16,
    xl: 22,
    xxl: 28,
    full: 9999,
  };

  const shadows = {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  };

  const typography = {
    h1: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    h5: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
    h6: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 26 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
    small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
    overline: { fontSize: 11, fontWeight: '600', lineHeight: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  };

  const animation = {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  };

  const breakpoints = {
    xs: 360,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1440,
  };

  const grid = {
    columns: {
      xs: 2,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    },
    gutter: spacing.md,
  };

  const touchTarget = {
    minimum: 44,
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      spacing, 
      borderRadius, 
      shadows, 
      typography, 
      animation, 
      breakpoints, 
      grid, 
      touchTarget,
      isDark, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
