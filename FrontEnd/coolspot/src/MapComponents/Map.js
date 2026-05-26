import React, { useState, useEffect, useContext, useRef} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WindowContext } from '../ContextProviders/WindowContext';
import AddSpotWindow from '../Windows/AddSpotWindow';

import streetViewIMG from '../images/street-view.png';
import sateliteViewIMG from '../images/satelite-view.png';
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa';

import { SpotSelectionContext } from '../ContextProviders/SpotSelectionProvider';


import { SpotsContext } from '../ContextProviders/SpotsContext';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';
import { ExtraFunctions } from '../ExtraFunctions';

import LocationSearchBar from './LocationSearchBar';
import MapUpdater from './MapUpdater';

import { MapContext } from '../ContextProviders/MapContext';

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
  const [mapCenter, setMapCenter] = useState([56.939860, 24.109501]);
  const [markersSpotInfo, setMarkers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const [buttonMessage, setButtonMessage] = useState('Add Your Spot');
  const [isLoggedIn, setIsLoggedIn] = useState(ExtraFunctions.isUserLoggedIn());
  const { currentUser } = useContext(CurrentUserContext);
  const [mapView, setMapView] = useState('streetview');

  const [savedMarkers, setSavedMarkers] = useState([]);

  const { spots, fetchSpots, setSpots, selectedSpotID, setSelectedSpotID } = useContext(SpotsContext);

  const [zoomLevel, setZoomLevel] = useState(9);

  const mapRef = useRef(null);

  const { mapCoords, updateMapCoords } = useContext(MapContext);


  const { category, updateCategory } = useContext(SpotSelectionContext);

  const bounds = [
    [-90, -180], // Southwest corner of the world
    [90, 180],   // Northeast corner of the world
  ];


  useEffect(() => {
    if(category!==""){
      const filteredSpots = savedMarkers.filter((spot) => spot.categories.includes(category));
      setMarkers(filteredSpots);
    }else{
      setMarkers(savedMarkers);
    }
  }, [category]);
  

  useEffect(() => {
    if (mapCoords.lat && mapCoords.lng) {
      setMapCenter([mapCoords.lat, mapCoords.lng]);
      setZoomLevel(12);
    }
  }, [mapCoords]);

  useEffect(() => {
    setMarkers(spots);
    setSavedMarkers(spots);
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
      setButtonMessage(isAdding ? 'Add Your Spot' : 'Click On Spot Location');
    }
  };

  const getButtonMessage = () => {
    if (!isLoggedIn) {
      return 'Log in to add spots';
    }
    return isAdding ? buttonMessage : 'Add Your Spot';
  };

  const toggleMapView = (viewType) => {
    setMapView(viewType);
  };

  const handleViewSpot = async(spotId) => {
    //console.log("izvelejos spotu spotId: ", spotId);
    setSelectedSpotID(spotId);
    updateWindowState('viewSpotWindow', { visible: true });
  };

  // Scroll to the selected spot when the selectedSpotID changes
  /*useEffect(() => {
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
  }, [selectedSpotID]);*/

  const handleLocate = (latitude, longitude) => {
    setMapCenter([latitude, longitude]);
    setZoomLevel(13);
  };
  
  const handleSearch = (name, lat, lng, zoom) => {
    console.log("name, ", name, " zoom: ", zoom);
    setMapCenter([lat, lng]);
    setZoomLevel(zoom); 
  };




  return (
    <div className="relative w-[90vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] bg-gray-400 rounded-lg shadow-md mx-auto z-0">
      
      <div className="absolute top-0 right-0 z-10 flex items-center space-x-2">
        <div className="bg-white rounded-lg shadow-lg p-2 w-full max-w-lg flex items-center">
          <LocationSearchBar onLocate={handleLocate} onSearch={handleSearch} />
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative w-full h-[90vw] sm:h-[80vw] md:h-[70vw] lg:h-[60vw] xl:h-[40vw]">
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          attributionControl={false} 
          style={{ height: '100%', width: '100%' }}
          className="z-0 leaflet-grab"
          zoomControl={false}
          maxBounds={bounds}
          maxBoundsViscosity={1}
          key={zoomLevel}
          whenReady={(map) => {
            map.target.on("zoomend", () => {
              const currentZoom = map.target.getZoom();
              //console.log(currentZoom);
              if (currentZoom < 2) {
                map.target.setZoom(2);
              }
            });


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
          {/* Integrate MapUpdater */}
          <MapUpdater center={mapCenter} zoomLevel={zoomLevel} />

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
          } ${!isLoggedIn && 'opacity-50 cursor-not-allowed'} whitespace-normal break-words`}
        >
          {getButtonMessage()}
        </button>

        {/* Buttons to toggle map view */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
          <img
            src={streetViewIMG}
            alt="Street View"
            className="w-12 h-12 cursor-pointer bg-white rounded-lg shadow-lg border border-black hover:border-2 transition-all"
            onClick={() => toggleMapView('street')}
          />
          <img
            src={sateliteViewIMG}
            alt="Satellite View"
            className="w-12 h-12 cursor-pointer bg-white rounded-lg shadow-lg border border-white hover:border-2 hover:border-white transition-all"
            onClick={() => toggleMapView('satellite')}
          />
        </div>

        <AddSpotWindow />
      </div>
    </div>
  );
}

export default MapDiv;
