import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function MapDiv({ addSpot }) {
  const position = [56.95175272999896, 24.11406032025138];
  const [markers, setMarkers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const addMarker = (latlng) => {
    setMarkers([...markers, latlng]);
    addSpot(latlng);  // Send the new spot to the parent component
    setIsAdding(false);
  };

  const toggleAddMarkerMode = () => {
    setIsAdding(!isAdding);
  };

  return (
    <div className="relative w-[40vw] h-[40vw] md:w-[50vw] md:h-[50vw] sm:w-[90vw] sm:h-[90vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />

        <Marker position={position} icon={customIcon}>
          <Popup>
            Brivibas piemineklis <br /> Super safe
          </Popup>
        </Marker>

        {markers.map((markerPosition, index) => (
          <Marker key={index} position={markerPosition} icon={customIcon}>
            <Popup>
              New Marker at [{markerPosition.lat}, {markerPosition.lng}]
            </Popup>
          </Marker>
        ))}

        <AddMarker onAddMarker={addMarker} isAdding={isAdding} />
      </MapContainer>

      <button
        onClick={toggleAddMarkerMode}
        className={`absolute bottom-4 right-4 text-white py-2 px-4 rounded-lg shadow-lg transition-all ${
          isAdding ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isAdding ? 'Click on the map to add the spot' : 'Add Marker'}
      </button>
    </div>
  );
}

export default MapDiv;
