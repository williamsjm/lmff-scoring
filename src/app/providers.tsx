import React from 'react';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { theme } from '../styles/theme';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider theme={theme} locale={esES}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};
