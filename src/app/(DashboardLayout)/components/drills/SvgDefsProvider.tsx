import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SvgDefsContextProps {
  addDef: (id: string, def: ReactNode) => void;
  removeDef: (id: string) => void;
  hasDef: (id: string) => boolean;
  defs: { [key: string]: ReactNode };
}

const SvgDefsContext = createContext<SvgDefsContextProps | undefined>(
  undefined,
);

export const SvgDefsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [defs, setDefs] = useState<{ [key: string]: ReactNode }>({});

  const addDef = (id: string, def: ReactNode) => {
    setDefs((prevDefs) => ({ ...prevDefs, [id]: def }));
  };

  const removeDef = (id: string) => {
    setDefs((prevDefs) => {
      const newDefs = { ...prevDefs };
      delete newDefs[id];
      return newDefs;
    });
  };

  const hasDef = (id: string) => {
    return Object.prototype.hasOwnProperty.call(defs, id);
  };

  return (
    <SvgDefsContext.Provider value={{ addDef, removeDef, hasDef, defs }}>
      {children}
    </SvgDefsContext.Provider>
  );
};

export const useSvgDefs = (): SvgDefsContextProps => {
  const context = useContext(SvgDefsContext);
  if (!context) {
    throw new Error('useSvgDefs must be used within a SvgDefsProvider');
  }
  return context;
};
