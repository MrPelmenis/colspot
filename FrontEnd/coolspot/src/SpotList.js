import React, { useEffect, useContext, useState } from 'react';
import Spot from './Spot';
import { SpotsContext } from './SpotsContext';
import { CurrentUserContext } from './CurrentUserContext';
import { FaFilter } from 'react-icons/fa';

function SpotList() {
  const { spots, setSpots, fetchSpots  } = useContext(SpotsContext);
  const { currentUser } = useContext(CurrentUserContext);
  const [sortOption, setSortOption] = useState('recent');

  // Fetch spots on component mount
  useEffect(() => {
    fetchSpots();
  }, [setSpots]);

  // Sort and filter spots based on the selected option
  const sortSpots = (spots, option) => {
    switch (option) {
      case 'mostLiked':
        return [...spots].sort((a, b) => b.likes - a.likes); 
      case 'recent':
        return [...spots].sort((a, b) => new Date(b.Time) - new Date(a.Time)); 
      case 'mySpots':
        let mySpots =[...spots].sort((a, b) => new Date(b.Time) - new Date(a.Time));  
        return mySpots.filter((spot) => spot.userName === currentUser.nickname);
      default:
        return spots;
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);
  const sortedSpots = sortSpots(spots, sortOption);

  return (
    <div className="w-[100vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] mx-auto p-6">
      {/* Spot Menu */}
      <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300">
        {/* Menu Title */}
        <div className="text-gray-700 font-semibold text-lg flex items-center">
          <FaFilter className="mr-2 text-blue-500" />
          <span>Filter Spots</span>
        </div>
        {/* Sort Dropdown */}
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="border p-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mySpots">My Spots</option>
        </select>
      </div>

      {/* Display Spots or Message */}
      {sortedSpots.length === 0 ? (
        <p className="text-white">No available spots D:</p>
      ) : (
        sortedSpots.map((spot, index) => (
          <Spot key={spot.Id || `${spot.userName}-${index}`} spot={spot} />
        ))
      )}
    </div>
  );
}

export default SpotList;
