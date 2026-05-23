import React, { useEffect, useRef, useState } from 'react';
import { FaPlusCircle, FaTimes } from 'react-icons/fa';

const CategorySelector = ({ visible, setSelectedCategories, selectedCategories }) => {
  const allCategories = [
    'Chill', 'Socializing', 'Dangerous', 'Scenic', 'Pay', 'Historical',
    'Foodie', 'Hidden Gem', 'Outdoor Activities', 'Nightlife',
    'Pet-Friendly', 'Family-Friendly', 'Artistic', 'Romantic'
  ];

  const [showDropdown, setShowDropdown] = useState(visible);
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setShowDropdown(false);
  }, [visible]);

  // Add category to selected list
  const handleAddCategory = (category) => {
    if (selectedCategories.length >= 3) {
      setErrorMessage('You can select a maximum of 3 categories.');
      return;
    }
    if (!selectedCategories.includes(category)) {
      setSelectedCategories((prev) => [...prev, category]);
      setErrorMessage('');
    }
  };

  // Remove category from selected list
  const handleRemoveCategory = (category) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
  };

  return (
    <div className="flex flex-col items-start space-y-2 pb-2">
      {/* Add Category Button */}
      {selectedCategories.length < 3 && (
        <div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <FaPlusCircle />
            Add Category
          </button>
        </div>
      )}

      {/* Dropdown */}
      {(showDropdown)&& (
        <div
          ref={dropdownRef}
          className="absolute bg-white border border-gray-300 rounded-md shadow-md p-2 mt-2 w-64 max-h-48 overflow-y-auto z-10"
        >
          <ul>
            {allCategories
              .filter((category) => !selectedCategories.includes(category))
              .map((category) => (
                <li
                  key={category}
                  className="p-2 cursor-pointer flex justify-between items-center border-b border-gray-300 hover:border-b-2 hover:border-gray-400 transition-colors duration-200"
                  onClick={() => {
                    handleAddCategory(category);
                    setShowDropdown(false); // Close dropdown after selection
                  }}
                >
                  <span>{category}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Selected Categories */}
      <div className="flex flex-wrap gap-2">
        {selectedCategories.length > 0 ? (
          selectedCategories.map((category) => (
            <div
              key={category}
              className="flex items-center gap-2 border border-gray-800 text-gray-800 px-4 py-2 rounded-lg"
            >
              <span>{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">No categories selected.</div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default CategorySelector;
