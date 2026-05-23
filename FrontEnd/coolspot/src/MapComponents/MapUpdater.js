import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapUpdater({ center, zoomLevel }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoomLevel || map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, zoomLevel, map]);

  return null;
}

export default MapUpdater;
