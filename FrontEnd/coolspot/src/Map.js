import React, { useState, useEffect } from 'react';
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

function MapDiv() {
  const position = [56.95175272999896, 24.11406032025138];
  const [markers, setMarkers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [description, setDescription] = useState("");

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
    setSelectedPosition(latlng);
    setShowModal(true);
  };

  const publishMarker = async () => {
    const geolocation = `${selectedPosition.lat},${selectedPosition.lng}`;
    const newMarker = { 
      Geolocation: geolocation,
      Description: description,
      Name: "Default Spot Name", 
      Karma: 0, 
      UserId: 1, 
      Time: new Date().toISOString() 
    };

    try {
      const response = await fetch('http://localhost:5000/api/spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMarker),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log(result);

      setMarkers([...markers, newMarker]); // Add the new marker to the local state
      setShowModal(false);
      setIsAdding(false);
      setDescription("");
    } catch (error) {
      console.error('Error adding spot:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsAdding(false);
    setDescription("");
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
