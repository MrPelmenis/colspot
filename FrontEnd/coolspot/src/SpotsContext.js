// SpotsContext.js
import React, { createContext, useState } from 'react';

export const SpotsContext = createContext();

export const SpotsProvider = ({ children }) => {
  const [spots, setSpots] = useState([]); // This will hold the fetched spots

  return (
    <SpotsContext.Provider value={{ spots, setSpots }}>
      {children}
    </SpotsContext.Provider>
  );
};
