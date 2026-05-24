import React from 'react';
import {
  FaCoffee,
  FaTree,
  FaSkating,
  FaHeart,
  FaDog,
  FaGem,
  FaUtensils,
  FaLandmark,
  FaCity,
  FaExclamationTriangle,
  FaMusic,
  FaSun,
  FaLock,
} from 'react-icons/fa';

const iconMap = {
  Chill: FaSun,
  Socializing: FaCity,
  Dangerous: FaExclamationTriangle,
  Scenic: FaTree,
  'Pay To Enter': FaLandmark,
  Historical: FaLandmark,
  Food: FaUtensils,
  'Hidden Gem': FaGem,
  Private: FaLock,
  Skate: FaSkating,
  Nightlife: FaMusic,
  'Pet-Friendly': FaDog,
  Romantic: FaHeart,
};

const Category = ({ name, isVisible }) => {
  const Icon = iconMap[name]; 

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-md border 
                  border-gray-300 shadow-sm hover:shadow-lg 
                  transition-all duration-300 cursor-pointer 
                  text-gray-800 bg-white hover:bg-gray-50 
                  ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {Icon && <Icon className="text-lg text-gray-600" />}
      <span className="text-sm font-semibold">{name}</span>
    </div>
  );
};

export default Category;
