import React, { useEffect, useContext, useState } from 'react';
import Spot from './Spot';
import { SpotsContext } from './ContextProviders/SpotsContext';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { FaFilter } from 'react-icons/fa';

function SpotList() {
  const {
    spots,
    setSpots,
    fetchSpots,
    spotsUpdated,
    setSpotsUpdated,
    selectedSpotID,
  } = useContext(SpotsContext);
  const { currentUser } = useContext(CurrentUserContext);
  const [sortOption, setSortOption] = useState('recent');
  const [selectedSpot, setSelectedSpot] = useState(null); // State to manage selected spot

  // Fetch spots on component mount
  useEffect(() => {
    fetchSpots();
  }, [setSpots]);

  useEffect(() => {
    if (spotsUpdated) {
      setSortOption('recent');
      setSpotsUpdated(false);
    }
  }, [spotsUpdated]);


  useEffect(() => {
    if (selectedSpotID) {
      const foundSpot = spots.find((spot) => spot.Id == selectedSpotID);
      setSelectedSpot(foundSpot);
      console.log('Selected Spot:', foundSpot); // Debug log
    } else {
      setSelectedSpot(null);
    }
  }, [selectedSpotID, spots]);


  const sortSpots = (spots, option) => {
    switch (option) {
      case 'mostLiked':
        return [...spots].sort((a, b) => b.likes - a.likes);
      case 'recent':
        return [...spots].sort((a, b) => new Date(b.Time) - new Date(a.Time));
      case 'mySpots':
        let mySpots = [...spots].sort((a, b) => new Date(b.Time) - new Date(a.Time));
        return mySpots.filter((spot) => spot.user_id === currentUser.userID);
      default:
        return spots;
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);
  const sortedSpots = sortSpots(spots, sortOption);

  return (
    <div className="w-[100vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] mx-auto p-6">

      {selectedSpot && (
        <div className="mb-4">
          <Spot key={selectedSpot.Id} spot={selectedSpot} isThisSpotSelected={true} />
        </div>
      )}

      {/* Spot Menu */}
      <div className="mb-4 flex justify-between items-center bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300">
        {/* Menu Title */}
        <div className="text-gray-700 font-semibold text-lg flex items-center">
          <span>Find Spots</span>
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
        <p className="text-white">No available spots...</p>
      ) : (
        sortedSpots.map((spot, index) => (
          <Spot key={spot.Id || `${spot.userName}-${index}`} spot={spot} isThisSpotSelected={false} />
        ))
      )}
    </div>
  );
}

export default SpotList;
