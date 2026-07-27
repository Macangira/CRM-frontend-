import React, { createContext, useContext, useEffect, useState } from 'react';

interface CommandPaletteContextType {
  isOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider
      value={{
        isOpen,
        openPalette: () => setIsOpen(true),
        closePalette: () => setIsOpen(false),
        togglePalette: () => setIsOpen(prev => !prev)
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return context;
};
