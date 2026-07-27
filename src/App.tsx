import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import { AppRoutes } from './routes/AppRoutes';
import { CustomCursor } from './components/common/CustomCursor';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CommandPaletteProvider>
            <CustomCursor />
            <AppRoutes />
          </CommandPaletteProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
