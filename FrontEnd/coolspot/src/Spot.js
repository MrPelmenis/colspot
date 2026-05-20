import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaHeart, FaComment, FaTrash } from 'react-icons/fa'; // Importing the icons
import TextWithReadMoreButton from './TextWithReadMoreButton';

function Spot({ spot }) {
  const [expanded, setExpanded] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false); // State to handle shrinking delay
  const spotRef = useRef(null);

  // Assuming your header height is 100px, you can adjust this value as needed
  const HEADER_HEIGHT = 200;

  // Generate a unique ID for each spot using useMemo to avoid re-calculating on each render
  const uniqueId = useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${spot.Name}-${spot.Description}-${randomNumber}`;
  }, [spot.Name, spot.Description]);

  const handleClickOutside = (event) => {
    if (spotRef.current && !spotRef.current.contains(event.target)) {
      if (expanded) {
        startShrinking(); // Start shrinking if clicked outside when expanded
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const startShrinking = () => {
    setIsShrinking(true);
    setTimeout(() => {
      setExpanded(false); // Collapse after the scale-down animation
      setIsShrinking(false);
    }, 500); // Matches the duration of scale-down animation (0.5s)
  };

  const handleLikeClick = (event) => {
    event.stopPropagation();
    alert('Liked!');
  };

  const handleCommentClick = (event) => {
    event.stopPropagation();
    alert('Commented!');
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    alert('Deleted!');
  };

  const handleSpotClick = () => {
    if (!expanded) {
      setExpanded(true); // Instantly expand when clicked

      // Scroll the spot into view with an offset to account for the header
      const spotPosition = spotRef.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = spotPosition - HEADER_HEIGHT;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleCloseSpot = (event) => {
    event.stopPropagation();
    startShrinking(); // Call the shrinking function
  };

  return (
    <div
      id={uniqueId} // Assign the unique ID to the div
      ref={spotRef}
      className={`relative w-full bg-white rounded-md shadow-md mb-4 p-4 transition-all duration-500 ease-in-out cursor-pointer 
                  ${expanded ? 'h-auto' : `${isShrinking ? '' : 'h-[100px]'}`} hover:bg-gray-200`}
      onClick={handleSpotClick}
    >
      {/* X button in the top-right corner */}
      <button
        className={`absolute top-0 right-0 w-8 h-8 rounded-tr-md rounded-bl-md text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500 transition-opacity duration-500 ${expanded ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleCloseSpot}
        style={{ transition: 'opacity 0.5s ease' }} // Smooth transition for the button
      >
        &times;
      </button>

      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xl font-semibold">{spot.Name}</p>
          <p className="text-sm text-gray-500">{spot.userName}</p>
        </div>
      </div>

      <TextWithReadMoreButton
        text={spot.Description}
        onReadMoreClick={handleSpotClick}
      />

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden 
                    ${expanded && !isShrinking ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ transitionProperty: 'max-height, opacity', transitionDuration: '0.5s' }}
      >
        <div
          className={`flex space-x-2 overflow-x-auto transition-transform duration-500 ease-in-out 
                      ${expanded && !isShrinking ? 'scale-100' : 'scale-0'}`}
        >
          {spot.Images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Spot ${spot.Name} - Image ${index + 1}`}
              className="h-[200px] object-contain rounded-md transition-transform duration-500 ease-in-out"
              style={{ transform: expanded && !isShrinking ? 'scale(1)' : 'scale(0)' }} // Scale effect on images
            />
          ))}
        </div>
      </div>

      <div
        className={`flex justify-between items-center mt-2 transition-opacity duration-500 ease-in-out ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex space-x-2">
          <button
            onClick={handleLikeClick}
            className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
            title="Like"
          >
            <FaHeart className="text-gray-600 hover:text-red-600" />
          </button>
          <button
            onClick={handleCommentClick}
            className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
            title="Comment"
          >
            <FaComment className="text-gray-600 hover:text-blue-600" />
          </button>
        </div>

        {/* Trash bin button on the right side */}
        <button
          onClick={handleDeleteClick}
          className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-red-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
          title="Delete"
        >
          <FaTrash className="text-gray-600 hover:text-red-600" />
        </button>
      </div>
    </div>
  );
}

export default Spot;
