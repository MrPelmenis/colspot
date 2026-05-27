import React, { createContext, useState } from 'react';

// Create the context
export const SpotSelectionContext = createContext();

const SpotSelectionProvider = (props) => {
  const [category, setCategory] = useState(""); // Now a string
  const [spotSort, setSpotSort] = useState("recent"); // Now a string
  const [mapBoundaries, setMapBoundaries] = useState({
    nw: { lat: 0, lng: 0 }, // Northwest corner
    se: { lat: 0, lng: 0 }, // Southeast corner
  });
  const updateSpotSort = (sort) => {
    setSpotSort(sort); // Directly set string
  }

  const updateCategory = (category) => {
    setCategory(category); // Directly set string
  }

  const updateMapBoundaries = (boundries) => {
    setMapBoundaries(boundries);
  }


  return (
    // Use the correct context provider
    <SpotSelectionContext.Provider value={{ category, updateCategory, spotSort, updateSpotSort, mapBoundaries, updateMapBoundaries }}>
      {props.children}
    </SpotSelectionContext.Provider>
  );
};

export default SpotSelectionProvider;
