import React, { useEffect, useContext, useState } from 'react';
import Spot from './Spot';
import { SpotsContext } from './ContextProviders/SpotsContext';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';

import { SpotSelectionContext } from './ContextProviders/SpotSelectionProvider';

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
  const [categoryFilter, setCategoryFilter] = useState(''); 
  const [selectedSpot, setSelectedSpot] = useState(null);

  
  const { category, updateCategory, spotSort, updateSpotSort } = useContext(SpotSelectionContext);

  const availableCategories = [
    "Chill", "Socializing", "Dangerous", "Scenic", "Pay", "Historical", 
    "Foodie", "Hidden Gem", "Outdoor Activities", "Nightlife", 
    "Pet-Friendly", "Family-Friendly", "Artistic", "Romantic"
  ];

  useEffect(() => {
    if (spotsUpdated) {
      setSortOption('recent');
      updateSpotSort("recent");
      setSpotsUpdated(false);
    }
  }, [spotsUpdated]);

  const sortSpots = (spots, option) => {
    let sortedSpots;
    switch (option) {
      case 'mostLiked':
        sortedSpots = [...spots].sort((a, b) => b.likes - a.likes);
        break;
      case 'recent':
        sortedSpots = [...spots].sort((a, b) => new Date(b.Time) - new Date(a.Time));
        break;
      case 'mySpots':
        sortedSpots = [...spots]
          .filter((spot) => spot.user_id === currentUser.userID)
          .sort((a, b) => new Date(b.Time) - new Date(a.Time));
        break;
      default:
        sortedSpots = spots;
    }
    return sortedSpots;
  };

  const filterSpotsByCategory = (spots, category) => {
    if (!category) return spots; 
    return spots.filter((spot) => spot.categories.includes(category));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    updateSpotSort(e.target.value);
    setTimeout(() => {
      fetchSpots();
    }, 1000);
  };

  
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    updateCategory(e.target.value);
    setTimeout(() => {
      fetchSpots();
    }, 1000);
  };

  const sortedSpots = sortSpots(spots, sortOption);
  const filteredSpots = filterSpotsByCategory(sortedSpots, categoryFilter);

  return (
    <div className="w-[90vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] mx-auto">
      <div className="mb-4 flex flex-col justify-center sm:flex-row sm:items-center bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-lg transition-colors duration-300 space-y-4 sm:space-y-0">
        <div className="text-gray-700 font-semibold text-lg flex-grow">
          <span>Find Spots</span>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <label htmlFor="categoryFilter" className="mr-2 text-gray-700">Category:</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="border p-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label htmlFor="sortOption" className="mr-2 text-gray-700">Sort By:</label>
            <select
              id="sortOption"
              value={sortOption}
              onChange={handleSortChange}
              className="border p-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="mostLiked">Most Liked</option>
              <option value="mySpots">My Spots</option>
            </select>
          </div>
        </div>
      </div>

      {filteredSpots.length === 0 ? (
        <p className="text-white">No available spots here...</p>
      ) : (
        filteredSpots.map((spot, index) => (
          <Spot
            key={spot.Id || `${spot.userName}-${index}`}
            spot={spot}
            isThisSpotSelected={false}
          />
        ))
      )}
    </div>
  );
}

export default SpotList;
