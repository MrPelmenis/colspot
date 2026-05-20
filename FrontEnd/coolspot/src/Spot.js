import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { FaHeart, FaComment, FaTrash, FaEdit } from 'react-icons/fa'; // Importing the icons
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './CurrentUserContext'; // Import CurrentUserContext

import { WindowContext } from './WindowContext';

function Spot({ spot }) {
  const [expanded, setExpanded] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const spotRef = useRef(null);
  const { currentUser } = useContext(CurrentUserContext); 

  const { windowStates, updateWindowState } = useContext(WindowContext);

  
  useEffect(() => {
    console.log(isShrinking);
  }, [isShrinking]);

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
    startShrinking();
    updateWindowState('deleteSpot', { visible: true, spotID: spot.Id });
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    startShrinking();
    updateWindowState('editSpotWindow', { visible: true, spotToEdit:spot });
  };

  const handleSpotClick = () => {
    if (!expanded) {
        setExpanded(true);
        if (spotRef.current) {
          const spotPosition = spotRef.current.getBoundingClientRect().top;
          //if anyone knows how to make this scroll work please
          /*window.scrollTo({
              top: spotPosition + window.innerHeight/2,
              behavior: 'smooth',
          });*/
        }
    };
  };

  const handleCloseSpot = (event) => {
    event.stopPropagation();
    startShrinking();
  };

  return (
    <div
      id={uniqueId}
      ref={spotRef}
      className={`relative w-full bg-white rounded-md shadow-md mb-4 p-4 transition-all duration-500 ease-in-out cursor-pointer 
                  ${expanded ? 'h-auto' : 'h-[150px]'} hover:bg-gray-200`} // Set fixed height for non-expanded state
      onClick={handleSpotClick}
    >
      <button
        className={`absolute top-0 right-0 w-8 h-8 rounded-tr-md rounded-bl-md text-2xl bg-red-600 text-white font-bold flex items-center justify-center 
                    transform transition-transform duration-500 
                    ${expanded && !isShrinking ? 'scale-100' : 'scale-0'}`}
        onClick={handleCloseSpot}
        style={{ transformOrigin: 'top right' }} // Ensure scaling originates from the top right corner
      >
        &times;
      </button>

      {/* Time Ago text */}
      <p
        className={`absolute right-1 text-xs text-gray-500 transition-all duration-500 
                    ${expanded && !isShrinking ? 'top-8' : 'top-2'} 
                    ${isShrinking ? 'transition-transform duration-500 translate-y-[-0px]' : ''}`} // Move up while shrinking
        style={{ transition: 'top 0.5s ease, transform 0.5s ease' }} // Moves the time below the red X when expanded
      >
        {ExtraFunctions.getTimeAgo(spot.Time)}
      </p>

      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xl font-semibold">{spot.Name}</p>
          <p className="text-sm text-gray-500">{spot.userName}</p>
        </div>
      </div>


      <TextWithReadMoreButton
        text={spot.Description}
        onReadMoreClick={handleSpotClick}
        spotClose={isShrinking}
        maxLength={20}
      />


      <div
        className={`transition-all flex justify-start duration-500 ease-in-out gap-2 overflow-x-auto overflow-y-hidden mt-1
                    ${expanded && !isShrinking ? 'max-h-[500px] opacity-100' : 'max-h-[100px]'}`}
        style={{ transitionProperty: 'max-height, opacity', transitionDuration: '0.5s' }}
      >
        {spot.Images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Spot ${spot.Name} - Image ${index + 1}`}
            className="h-[200px] w-[200px] object-contain rounded-md transition-scale duration-500 ease-in-out" // Added fixed width
            style={{ 
              scale: `${expanded && !isShrinking ? "1" : '0.25'}`,
              transformOrigin: 'top left'
            }}
          />
        ))}
      </div>



      <div
        className={`flex justify-between items-center mt-2 transition-opacity duration-500 ease-in-out ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex space-x-2">
          <button
            onClick={handleLikeClick}
            className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
            title="Like"
            disabled={!expanded}
          >
            <FaHeart className="text-gray-600 hover:text-red-600" />
          </button>
          <button
            onClick={handleCommentClick}
            className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
            title="Comment"
            disabled={!expanded}
          >
            <FaComment className="text-gray-600 hover:text-blue-600" />
          </button>

        </div>

        <div className='flex'>
          {spot.userName === currentUser.nickname && ( 
              <button
                onClick={handleEditClick}
                className={`flex items-center justify-center w-10 h-10 mr-2 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
                title="Edit"
                disabled={!expanded}
              >
                <FaEdit className="text-gray-600 hover:text-green-600" />
              </button>
          )}
          
          {spot.userName === currentUser.nickname && (
            <button
              onClick={handleDeleteClick}
              className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-red-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
              title="Delete"
              disabled={!expanded}
            >
              <FaTrash className="text-gray-600 hover:text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Spot;
