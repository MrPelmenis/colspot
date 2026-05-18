import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WindowContext } from './WindowContext';
import AddSpotWindow from './AddSpotWindow'; // Ensure you import your AddSpotWindow component

const customIcon = new L.Icon({
  iconUrl: '/images/map_marker.png',
  iconSize: [32, 35],
  iconAnchor: [16, 35],
  popupAnchor: [0, -30]
});

function AddMarker({ onAddMarker, isAdding }) {
  useMapEvents({
    click(e) {
      if (isAdding) {
        onAddMarker(e.latlng);
      }
    },
  });
  return null;
}

function MapDiv() {
  const position = [56.95175272999896, 24.11406032025138];
  const [markers, setMarkers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const { updateWindowState } = useContext(WindowContext);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/spots');
        const data = await response.json();
        setMarkers(data);
      } catch (error) {
        console.error('Error fetching spots:', error);
      }
    };

    fetchSpots();
  }, []);

  const handleMapClick = (latlng) => {
    updateWindowState('addSpotWindow', { visible: true, geoLocation: latlng });
  };

  const toggleAddMarkerMode = () => {
    setIsAdding(!isAdding);
  };

  return (
    <div className="relative w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[60vw] lg:h-[60vw] xl:w-[50vw] xl:h-[50vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />

        {markers.map((markerPosition, index) => {
          const [lat, lng] = markerPosition.Geolocation.split(',').map(Number);

          if (isNaN(lat) || isNaN(lng)) {
            console.error('Invalid Geolocation:', markerPosition.Geolocation);
            return null; 
          }

          return (
            <Marker key={index} position={{ lat, lng }} icon={customIcon}>
              <Popup>
                {markerPosition.Description} <br /> Geolocation: [{markerPosition.Geolocation}]
              </Popup>
            </Marker>
          );
        })}

        <AddMarker onAddMarker={handleMapClick} isAdding={isAdding} />
      </MapContainer>

      <button
        onClick={toggleAddMarkerMode}
        className={`absolute bottom-4 right-4 text-white py-2 px-4 rounded-lg shadow-lg transition-all ${
          isAdding ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isAdding ? 'Click to add the spot' : 'Add Your Spot'}
      </button>

      <AddSpotWindow />
    </div>
  );
}

export default MapDiv;
