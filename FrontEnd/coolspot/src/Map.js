import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const customIcon = new L.Icon({
  iconUrl: '/images/map_marker.png', 
  iconSize: [32, 35],
  iconAnchor: [16, 35], 
  popupAnchor: [0, -30] 
});

function Map() {
  const position = [56.95175272999896, 24.11406032025138]; 

  return (
    <div className="w-[60vw] h-[60vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
        {
        <Marker position={position} icon={customIcon}>
          <Popup>
            Brivibas piemineklis <br /> Super safe
          </Popup>
        </Marker>
        }
      </MapContainer>
    </div>
  );
}

export default Map;
