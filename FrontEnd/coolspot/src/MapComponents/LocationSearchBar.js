import React, { useState } from 'react';
import { FaLocationArrow, FaSearch } from 'react-icons/fa';

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
          console.log('Unable to retrieve your location');
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
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

    if (maxDiff > 30) return 7;
    if (maxDiff > 15) return 8;
    if (maxDiff > 5) return 9;
    if (maxDiff > 2) return 10;
    if (maxDiff > 0.5) return 11;
    return 12;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full p-4 bg-gray-100 shadow-md rounded-lg space-y-2 sm:space-y-0">
      <div className="flex flex-col sm:flex-row items-center w-full sm:max-w-md space-y-2 sm:space-y-0">
        <div className="relative w-full">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for a city..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(suggestion.name);
                    setSuggestions([]);
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
          className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 transition-all sm:ml-2"
        >
          <FaLocationArrow className="mr-2" />
          Locate Me
        </button>
      </div>
    </div>
  );
}

export default LocationSearchBar;
