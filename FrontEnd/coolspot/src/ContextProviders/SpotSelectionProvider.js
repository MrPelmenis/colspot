import React, { createContext, useState } from 'react';

// Create the context
export const SpotSelectionContext = createContext();

const SpotSelectionProvider = (props) => {
  const [category, updateSelection] = useState({ category: "" });

  const updateCategory = (coords) => {
    updateSelection(coords);
  };

  return (
    // Use the correct context provider
    <SpotSelectionContext.Provider value={{ category, updateCategory }}>
      {props.children}
    </SpotSelectionContext.Provider>
  );
};

export default SpotSelectionProvider;
