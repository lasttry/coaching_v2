import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectionContextProps {
  selectedId: string | null;
  select: (id: string) => void;
  deselect: () => void;
}

const SelectionContext = createContext<SelectionContextProps | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const select = (id: string): void => {
    setSelectedId(id);
  };

  const deselect = (): void => {
    setSelectedId(null);
  };

  return (
    <SelectionContext.Provider value={{ selectedId, select, deselect }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = (): SelectionContextProps => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
