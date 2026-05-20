// SpotsContext.js
import React, { createContext, useState } from 'react';

export const SpotsContext = createContext();

export const SpotsProvider = ({ children }) => {
  const [spots, setSpots] = useState([]); 

  const fetchSpots = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/spots');
      const data = await response.json();
      setSpots(data); // Update spots in context
    } catch (error) {
      console.error('Error fetching spots:', error);
    }
  };

  return (
    <SpotsContext.Provider value={{ spots, setSpots, fetchSpots }}>
      {children}
    </SpotsContext.Provider>
  );
};
