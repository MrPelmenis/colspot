import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaComment } from 'react-icons/fa'; // Importing icons
import TextWithReadMoreButton from './TextWithReadMoreButton';

function Spot({ spot }) {
  const [expanded, setExpanded] = useState(false);
  const spotRef = useRef(null);

  const handleClickOutside = (event) => {
    if (spotRef.current && !spotRef.current.contains(event.target)) {
      setExpanded(false); 
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLikeClick = (event) => {
    event.stopPropagation(); 
    alert('Liked!');
  };

  const handleCommentClick = (event) => {
    event.stopPropagation(); 
    alert('Commented!');
  };

  const handleSpotClick = () => {
    setExpanded(true);
  };

  return (
    <div 
      ref={spotRef} 
      className={`relative w-full bg-white rounded-md shadow-md mb-4 p-4 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden 
                  ${expanded ? 'h-auto' : 'h-[100px] hover:bg-gray-200'}`} 
      onClick={handleSpotClick} 
    >
      
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
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`flex space-x-2 overflow-x-auto transition-transform duration-500 ease-in-out ${expanded ? 'scale-100' : 'scale-0'}`}>
          {spot.Images.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Spot ${spot.Name} - Image ${index + 1}`} 
              className="h-[200px] object-contain rounded-md transform transition-transform duration-500 ease-in-out"
              style={{ transform: expanded ? 'scale(1)' : 'scale(0)', transition: 'transform 0.5s ease-in-out' }} // Scale effect on images
            />
          ))}
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${expanded ? 'scale-100' : 'scale-0'} overflow-hidden mt-2`}>
        <div className="flex space-x-2">
          <button 
            onClick={handleLikeClick} 
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
            title="Like"
          >
            <FaHeart className="text-gray-600 hover:text-red-600" />
          </button>
          <button 
            onClick={handleCommentClick} 
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
            title="Comment"
          >
            <FaComment className="text-gray-600 hover:text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Spot;
