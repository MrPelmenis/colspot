import React, { createContext, useState } from 'react';

export const MapContext = createContext();

const MapProvider = (props) => {
  const [mapCoords, setMapCoords] = useState({ lat: 0, lng: 0 });

  const updateMapCoords = (coords) => {
    setMapCoords(coords);
  };

  return (
    <MapContext.Provider value={{ mapCoords, updateMapCoords }}>
      {props.children}
    </MapContext.Provider>
  );
};

export default MapProvider;
