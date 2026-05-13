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
  const [showModal, setShowModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [description, setDescription] = useState("");

  // atver modalu lai editotu markieri
  const handleMapClick = (latlng) => {
    setSelectedPosition(latlng);
    setShowModal(true); 
  };

  // Ieliek markeri un aizsuta uz spotlistu
  const publishMarker = () => {
    const newMarker = { ...selectedPosition, description };
    setMarkers([...markers, newMarker]);
    addSpot(newMarker); 
    setShowModal(false);
    setIsAdding(false);
    setDescription("");
  };

  // aizver
  const closeModal = () => {
    setShowModal(false);
    setIsAdding(false);
    setDescription("");
  };

  const toggleAddMarkerMode = () => {
    setIsAdding(!isAdding);
  };

  return (
    <div className="relative w-[40vw] h-[40vw] md:w-[50vw] md:h-[50vw] sm:w-[90vw] sm:h-[90vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      
        {/*Markeri*/}
        {markers.map((markerPosition, index) => (
          <Marker key={index} position={markerPosition} icon={customIcon}>
            <Popup>
              {markerPosition.description} <br /> [{markerPosition.lat}, {markerPosition.lng}]
            </Popup>
          </Marker>
        ))}

      {/*Modelis kursh addo markieri*/}
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

      {/* Marker Lodzins */}
      {showModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[50vw] h-[50vh] p-8 relative">
            <h2 className="text-lg font-bold mb-4">Add Marker Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[200px] border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter a description for the marker..."
            />
            <div className="flex justify-between">
              <button
                onClick={publishMarker}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Publish
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 filter blur-sm z-40" />
      )}
    </div>
  );
}

export default MapDiv;
