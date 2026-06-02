import React, { createContext, useState } from 'react';

export const SpotSelectionContext = createContext();

const SpotSelectionProvider = (props) => {
  const [category, setCategory] = useState(""); 
  const [spotSort, setSpotSort] = useState("recent"); 
  const [mapBoundaries, setMapBoundaries] = useState({
    nw: { lat: 0, lng: 0 },
    se: { lat: 0, lng: 0 }, 
  });
  const updateSpotSort = (sort) => {
    setSpotSort(sort); 
  }

  const updateCategory = (category) => {
    setCategory(category); 
  }

  const updateMapBoundaries = (boundries) => {
    setMapBoundaries(boundries);
  }


  return (
    <SpotSelectionContext.Provider value={{ category, updateCategory, spotSort, updateSpotSort, mapBoundaries, updateMapBoundaries }}>
      {props.children}
    </SpotSelectionContext.Provider>
  );
};

export default SpotSelectionProvider;
