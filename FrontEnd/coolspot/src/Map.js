import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WindowContext } from './ContextProviders/WindowContext';
import AddSpotWindow from './Windows/AddSpotWindow';

import streetViewIMG from './images/street-view.png';
import sateliteViewIMG from './images/satelite-view.png';

import { SpotsContext } from './ContextProviders/SpotsContext';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { ExtraFunctions } from './ExtraFunctions';

const customIcon = new L.Icon({
  iconUrl: '/images/map_marker.png',
  iconSize: [32, 35],
  iconAnchor: [16, 35],
  popupAnchor: [0, -30],
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
  const [markersSpotInfo, setMarkers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const [buttonMessage, setButtonMessage] = useState('Click to add the spot');
  const [isLoggedIn, setIsLoggedIn] = useState(ExtraFunctions.isUserLoggedIn());
  const { currentUser } = useContext(CurrentUserContext);
  const [mapView, setMapView] = useState('satellite');

  const { spots, setSpots, selectedSpotID, setSelectedSpotID } = useContext(SpotsContext);

  useEffect(() => {
    setMarkers(spots);
  }, [spots]);

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
      setButtonMessage(isAdding ? 'Click to add the spot' : 'Click on spot location');
    }
  };

  const getButtonMessage = () => {
    if (!isLoggedIn) {
      return 'You must be logged in to add spots';
    }
    return isAdding ? buttonMessage : 'Click to add the spot';
  };

  const toggleMapView = (viewType) => {
    setMapView(viewType);
  };

  const handleViewSpot = (spotId) => {
    setSelectedSpotID(spotId);
  };

  // Scroll to the selected spot when the selectedSpotID changes
  useEffect(() => {
    if (selectedSpotID) {
      const element = document.getElementById('spot-' + selectedSpotID);
      if (element) {
        setTimeout(() => {
          const offsetTop = element.getBoundingClientRect().top + window.scrollY - 800;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [selectedSpotID]);

  return (
    <div className="relative w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[60vw] lg:h-[60vw] xl:w-[50vw] xl:h-[50vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0 leaflet-grab"
        whenReady={(map) => {
          const container = map.target.getContainer();
          container.style.cursor = 'default';

          map.target.on('dragstart', () => {
            container.style.cursor = 'grabbing';
          });

          map.target.on('dragend', () => {
            container.style.cursor = 'pointer';
          });

          map.target.on('movestart', () => {
            container.style.cursor = 'grabbing';
          });

          map.target.on('moveend', () => {
            container.style.cursor = 'pointer';
          });
        }}
      >
        {mapView === 'satellite' ? (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        ) : (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

        {markersSpotInfo.map((spotMarker, index) => {
          const [lat, lng] = String(spotMarker.Geolocation).split(',').map(Number);

          if (isNaN(lat) || isNaN(lng)) {
            console.error('Invalid Geolocation:', spotMarker);
            return null;
          }

          return (
            <Marker key={index} position={{ lat, lng }} icon={customIcon}>
              <Popup>
                <div className="flex flex-col items-start">
                  <div className="text-left">
                    <div className="font-bold text-sm">{spotMarker.Name}</div>
                    <div className="text-gray-600 text-xs">{spotMarker.nickname}</div>
                  </div>
                  {spotMarker.Images && spotMarker.Images[0] && (
                    <img
                      src={spotMarker.Images[0]}
                      alt="Spot Thumbnail"
                      className="h-auto max-h-[50px] object-contain border rounded-sm border-gray-400"
                      style={{ margin: '1px' }}
                    />
                  )}
                  <a
                    href="#"
                    onClick={() => handleViewSpot(spotMarker.Id)}
                    className="text-blue-500 hover:underline cursor-pointer pt-1"
                    style={{ margin: '1px' }}
                  >
                    View Spot
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <AddMarker onAddMarker={handleMapClick} isAdding={isAdding} />
      </MapContainer>

      <button
        onClick={toggleAddMarkerMode}
        disabled={!isLoggedIn}
        className={`absolute bottom-4 right-4 text-black py-2 px-4 rounded-lg shadow-lg border-2 border-black transition-all ${
          isAdding ? 'bg-gray-300 hover:bg-gray-400' : 'bg-white hover:bg-gray-100'
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
