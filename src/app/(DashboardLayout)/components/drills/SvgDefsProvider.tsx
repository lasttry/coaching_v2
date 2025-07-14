import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type DefsMap = { [key: string]: ReactNode };

interface SvgDefsContextProps {
  addDef: (id: string, def: ReactNode) => void;
  removeDef: (id: string) => void;
  hasDef: (id: string) => boolean;
  defs: DefsMap;
}

const SvgDefsContext = createContext<SvgDefsContextProps | undefined>(undefined);

export const SvgDefsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defs, setDefs] = useState<DefsMap>({});

  const addDef = useCallback((id: string, def: ReactNode) => {
    setDefs((prevDefs) => ({
      ...prevDefs,
      [id]: def, // Add or update the definition
    }));
  }, []);

  const removeDef = useCallback((id: string) => {
    setDefs((prevDefs) => {
      const newDefs = { ...prevDefs };
      delete newDefs[id];
      return newDefs;
    });
  }, []);

  const hasDef = useCallback(
    (id: string) => Object.prototype.hasOwnProperty.call(defs, id),
    [defs]
  );

  return (
    <SvgDefsContext.Provider value={{ addDef, removeDef, hasDef, defs }}>
      {children}
    </SvgDefsContext.Provider>
  );
};

export const SvgDefs: React.FC = React.memo(() => {
  const { defs } = useSvgDefs();
  return (
    <defs>
      {Object.entries(defs).map(([id, def]) => (
        <React.Fragment key={id}>{def}</React.Fragment>
      ))}
    </defs>
  );
});
SvgDefs.displayName = 'SvgDefs';

export const useSvgDefs = (): SvgDefsContextProps => {
  const context = useContext(SvgDefsContext);
  if (!context) {
    throw new Error('useSvgDefs must be used within a SvgDefsProvider');
  }
  return context;
};
