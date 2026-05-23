import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.setView(center); // Update the map's view when center changes
    }
  }, [center, map]);

  return null;
} 
export default MapUpdater;
