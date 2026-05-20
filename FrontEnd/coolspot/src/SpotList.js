import React, { useEffect, useContext, useState } from 'react';
import Spot from './Spot';
import { SpotsContext } from './SpotsContext';
import { CurrentUserContext } from './CurrentUserContext';
import { FaFilter } from 'react-icons/fa';

function SpotList() {
  const { spots, setSpots } = useContext(SpotsContext);
  const [sortOption, setSortOption] = useState('recent'); // State to track the selected sorting option
  const { currentUser } = useContext(CurrentUserContext);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/spots');
        const data = await response.json();
        console.log('Fetched spots:', data); // Log fetched data for debugging
        setSpots(data); // Set the spots in the context
      } catch (error) {
        console.error('Error fetching spots:', error);
      }
    };

    fetchSpots();
  }, [setSpots]);

  const sortSpots = (spots, option) => {
    console.log(spots)
    switch (option) {
      case 'mostLiked':
        return [...spots].sort((a, b) => b.likes - a.likes); // Sort by most liked
      case 'recent':
        return [...spots].sort((a, b) => new Date(b.Time) - new Date(a.Time)); // Sort by most recent
      case 'mySpots':
        return spots.filter((spot) => spot.userName === currentUser.nickname);
      default:
        return spots;
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const sortedSpots = sortSpots(spots, sortOption);

  return (
    <div className="w-[100vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] mx-auto p-6">
      {/* Spot Menu */}
      <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300">
        {/* Menu Title */}
        <div className="text-gray-700 font-semibold text-lg flex items-center">
          <FaFilter className="mr-2 text-blue-500" /> {/* Decorative filter icon */}
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

      {sortedSpots.length === 0 ? (
        <p className='text-white'>No available spots D:</p>
      ) : (
        sortedSpots.map((spot) => <Spot key={spot.Id} spot={spot} />)
      )}
    </div>
  );
}

export default SpotList;
