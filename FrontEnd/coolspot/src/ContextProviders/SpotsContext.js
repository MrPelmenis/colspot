// SpotsContext.js
import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

import { SpotSelectionContext } from './SpotSelectionProvider';


export const SpotsContext = createContext();

export const SpotsProvider = ({ children }) => {
  const [spots, setSpots] = useState([]); 
  const [spotsUpdated, setSpotsUpdated ] = useState(false);
  const [selectedSpotID, setSelectedSpotID] = useState(null);

  const { category, updateCategory, spotSort, setSpotSort, mapBoundaries, updateMapBoundaries } = useContext(SpotSelectionContext);

  const fetchParamsRef = useRef({ category, spotSort, mapBoundaries });

  // Update ref when context changes
  useEffect(() => {
    fetchParamsRef.current = { category, spotSort, mapBoundaries };
  }, [category, spotSort, mapBoundaries]);


  const fetchSpots = async () => {
    try {
      const { category, spotSort, mapBoundaries } = fetchParamsRef.current;
      
      /*console.log("Fetching with:", { 
        category, 
        spotSort, 
        nw: mapBoundaries.nw, 
        se: mapBoundaries.se 
      });*/


      const queryParams = new URLSearchParams({
        category: category || "", // Fallback to empty string if undefined
        sort: spotSort || "", // Fallback to empty string if undefined
        nw_lat: mapBoundaries.nw.lat, // Latitude of northwest corner
        nw_lng: mapBoundaries.nw.lng, // Longitude of northwest corner
        se_lat: mapBoundaries.se.lat, // Latitude of southeast corner
        se_lng: mapBoundaries.se.lng, // Longitude of southeast corner
      });

      const url = `${window.websiteSetting.serverURL}/api/spots?${queryParams.toString()}`;

      //console.log("url:", url);

      const response = await fetch(url);
      const data = await response.json();
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
