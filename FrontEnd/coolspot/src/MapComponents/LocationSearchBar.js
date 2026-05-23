import React, { useState } from 'react';
import { FaLocationArrow } from 'react-icons/fa';

function LocationSearchBar({ onLocate, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocate(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to retrieve your location');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${window.websiteSetting.OPEN_CAGE_KEY}&limit=5`
        );
        const data = await response.json();
        if (data.results) {
          const formattedSuggestions = data.results.map((result) => ({
            name: result.formatted,
            lat: result.geometry.lat,
            lng: result.geometry.lng,
            bounds: result.bounds, 
          }));
          setSuggestions(formattedSuggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const calculateZoom = (bounds) => {
    if (!bounds) return 13;  
    
    
    const latDiff = Math.abs(bounds.northeast.lat - bounds.southwest.lat);
    const lngDiff = Math.abs(bounds.northeast.lng - bounds.southwest.lng);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    // Use maxDiff to determine an appropriate zoom level
    if (maxDiff > 30) return 7;  // For extremely large countries or continents
    if (maxDiff > 15) return 8;  // For large countries
    if (maxDiff > 5) return 9;   // For large capitals or big cities
    if (maxDiff > 2) return 10;  // For average-sized cities
    if (maxDiff > 0.5) return 11; // For smaller cities or towns
    return 12;  // For villages or very small areas
  };

  return (
    <div className="flex justify-between items-center w-full p-4 bg-white shadow-md rounded-lg">
      <span className="text-gray-600 text-lg font-semibold">Find Me</span>
      
      <div className="flex items-center w-full max-w-md mx-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a city..."
            className="w-full p-2 rounded-l-md border-t border-l border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-10 left-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(suggestion.name);
                    setSuggestions([]);
                    // Pass both name, coordinates, and bounds to onSearch
                    const zoomLevel = calculateZoom(suggestion.bounds);
                    onSearch(suggestion.name, suggestion.lat, suggestion.lng, zoomLevel);
                  }}
                >
                  {suggestion.name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleLocateMe}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-r-md shadow-md hover:bg-blue-600 transition-all"
        >
          <FaLocationArrow className="mr-2" />
          Locate Me
        </button>
      </div>
    </div>
  );
}

export default LocationSearchBar;
