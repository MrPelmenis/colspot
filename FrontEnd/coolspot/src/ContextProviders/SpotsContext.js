// SpotsContext.js
import React, { createContext, useState } from 'react';

export const SpotsContext = createContext();

export const SpotsProvider = ({ children }) => {
  const [spots, setSpots] = useState([]); 
  const [spotsUpdated, setSpotsUpdated ] = useState(false);
  const [selectedSpotID, setSelectedSpotID] = useState(null);

  const fetchSpots = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/spots');
      const data = await response.json();
      //console.log("spots:", data);
      setSpots(data);
    } catch (error) {
      console.error('Error fetching spots:', error);
    }
  };

  const getSingleSpotById = (spotID) => {
    //console.log("mekleju spotu pec id:", spotID);
    const spot = spots.find((spot) => spot.Id === spotID);
    return spot || null;
  };
  

  return (
    <SpotsContext.Provider value={{ spots, setSpots, fetchSpots, spotsUpdated, selectedSpotID, setSelectedSpotID, getSingleSpotById, setSpotsUpdated }}>
      {children}
    </SpotsContext.Provider>
  );
};
