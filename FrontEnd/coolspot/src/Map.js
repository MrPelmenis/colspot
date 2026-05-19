import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WindowContext } from './WindowContext';
import AddSpotWindow from './AddSpotWindow'; 

import streetViewIMG from './images/street-view.png';
import sateliteViewIMG from './images/satelite-view.png';


import { CurrentUserContext } from './CurrentUserContext';
import { ExtraFunctions } from './ExtraFunctions';

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
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const [buttonMessage, setButtonMessage] = useState("Click to add the spot");
  const [isLoggedIn, setIsLoggedIn] = useState(ExtraFunctions.isUserLoggedIn());
  const { currentUser } = useContext(CurrentUserContext);
  const [mapView, setMapView] = useState('satellite'); // new state to toggle between views

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
    if(!windowStates.addSpotWindow.visible){
      fetchSpots();
    }
  }, [windowStates.addSpotWindow.visible]);

  useEffect(() => {
    setIsLoggedIn(ExtraFunctions.isUserLoggedIn());
  }, [currentUser]);

  const handleMapClick = (latlng) => {
    updateWindowState('addSpotWindow', { visible: true, geoLocation: latlng });
    setIsAdding(!isAdding);
  };

  const toggleAddMarkerMode = () => {
    if (isLoggedIn) {
      setIsAdding(!isAdding);
      setButtonMessage(isAdding ? "Click to add the spot" : "Click on spot location");
    }
  };

  const getButtonMessage = () => {
    if (!isLoggedIn) {
      return "You must be logged in to add spots";
    }
    return isAdding ? buttonMessage : "Click to add the spot";
  };

  const toggleMapView = (viewType) => {
    setMapView(viewType);
  };

  return (
    <div className="relative w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[60vw] lg:h-[60vw] xl:w-[50vw] xl:h-[50vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0 leaflet-grab"
        whenReady={(map) => {
          /*kartei lai kursors normaali izskataas*/
          const container = map.target.getContainer();
          container.style.cursor = "default"; 

          map.target.on('dragstart', () => {
            container.style.cursor = "grabbing"; 
          });

          map.target.on('dragend', () => {
            container.style.cursor = "pointer"; 
          });

          map.target.on('movestart', () => {
            container.style.cursor = "grabbing"; 
          });

          map.target.on('moveend', () => {
            container.style.cursor = "pointer"; 
          });
        }}
      >
        {mapView === 'satellite' ? (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        ) : (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

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
        disabled={!isLoggedIn}
        className={`absolute bottom-4 right-4 text-white py-2 px-4 rounded-lg shadow-lg transition-all ${
          isAdding ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
        } ${!isLoggedIn && 'opacity-50 cursor-not-allowed'}`}
      >
        {getButtonMessage()}
      </button>

      {/* Buttons to toggle map view */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        <img
          src={streetViewIMG}
          alt="Street View"
          className="w-12 h-12 cursor-pointer bg-white rounded-lg shadow-lg border border-gray-300 hover:border-gray-400 transition-all"
          onClick={() => toggleMapView('street')}
        />
        <img
          src={sateliteViewIMG}
          alt="Satellite View"
          className="w-12 h-12 cursor-pointer bg-white rounded-lg shadow-lg border border-gray-300 hover:border-gray-400 transition-all"
          onClick={() => toggleMapView('satellite')}
        />
      </div>

      <AddSpotWindow />
    </div>
  );
}

export default MapDiv;
