import React, { createContext, useContext, useState } from 'react';

const TreeContext = createContext();

export const TreeProvider = ({ children }) => {
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);

  return (
    <TreeContext.Provider value={{ trees, setTrees, selectedTree, setSelectedTree }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
}; 