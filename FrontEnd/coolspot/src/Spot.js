import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { FaHeart, FaComment, FaTrash, FaEdit } from 'react-icons/fa';
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { WindowContext } from './ContextProviders/WindowContext';
import { CommentContext } from './ContextProviders/CommentProvider';
import Category from './Category.js';

import { SpotsContext } from './ContextProviders/SpotsContext';

function Spot({ spot, isThisSpotSelected }) {
  const [expanded, setExpanded] = useState(isThisSpotSelected);
  const [isShrinking, setIsShrinking] = useState(false);
  const spotRef = useRef(null);
  const { currentUser } = useContext(CurrentUserContext);
  const { visibleComments, setVisibleComments, fetchComment, commentInfo, setCommentInfo, setCommentSpotID } = useContext(CommentContext);
  const { windowStates, updateWindowState } = useContext(WindowContext);

  const {selectedSpotID, setSelectedSpotID } = useContext(SpotsContext);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(spot.likes);

  const exampleCategories = ["Historical", "Scenic", "Chill"];

  const uniqueId = useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${spot.Name}-${spot.Description}-${randomNumber}`;
  }, [spot.Name, spot.Description]);

  const handleClickOutside = (event) => {
    if (spotRef.current && !spotRef.current.contains(event.target)) {
      if (expanded) {
        if(!isThisSpotSelected){
          handleCloseSpot();
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  useEffect(() => {
    if (spot.liked_by.includes(currentUser.userID)) {
      setLiked(true);
    }else{
      setLiked(false);  
    }
  }, [spot.liked_by, currentUser.userID]);

  const startShrinking = () => {
    setIsShrinking(true);
    setTimeout(() => {
      setExpanded(false);
      setIsShrinking(false);
    }, 500);
  };


  const handleCommentClick = async (event) => {
    event.stopPropagation();
    if(!isThisSpotSelected){
      handleCloseSpot();
    }
    setCommentSpotID(spot.Id);
    await fetchComment(spot.Id);
    setVisibleComments(true);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    if(!isThisSpotSelected){
      handleCloseSpot();
    }
    updateWindowState('deleteSpot', { visible: true, spotID: spot.Id });
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    if(!isThisSpotSelected){
      handleCloseSpot();
    }
    updateWindowState('editSpotWindow', { visible: true, spotToEdit: spot });
  };

  const handleSpotClick = () => {
    if (!expanded) {
        setExpanded(true);
        if (spotRef.current) {
        }
    }
  };

  const handleLikeClick = async () => {
    const url = `http://localhost:5000/api/spots/${spot.Id}/likes`;

    const jwtToken = localStorage.getItem('JWT');

    if (liked) {
      // Dislike action
      try {
        await fetch(`${url}/${currentUser.userID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } catch (error) {
        console.error('Error disliking the spot:', error);
      }
    } else {
      // Like action
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ user_id: currentUser.userID }),  // Matches backend key
        });
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } catch (error) {
        console.error('Error liking the spot:', error);
      }
    }
  };


  const handleCloseSpot = () => { 
    if(isThisSpotSelected){
      setSelectedSpotID(null);
    }else{
      startShrinking();
    }
  };

  return (
    <div
      id={"spot-" + spot.Id}
      ref={spotRef}
      className={`relative w-full min-w-[300px] bg-white rounded-md shadow-md mb-4 p-4 transition-all duration-500 ease-in-out cursor-pointer
        ${expanded ? 'h-auto' : `${isShrinking ? '' : 'h-[160px]'}`} 
        ${isThisSpotSelected ? 'border-4 border-gray-600 rounded-xl bg-blue-50' : 'hover:bg-gray-200'}`}  // Add this line for selected spot styling
      onClick={handleSpotClick}
    >
      <button
        className={`absolute top-0 right-0 w-8 h-8 rounded-tr-md rounded-bl-md text-2xl bg-red-600 text-white font-bold flex items-center justify-center 
                    transform transition-transform duration-500 
                    ${expanded && !isShrinking ? 'scale-100' : 'scale-0'}`}
        onClick={handleCloseSpot}
        style={{ transformOrigin: 'top right' }}
      >
        &times;
      </button>

      {spot.Images[0] && (
        <img
          src={spot.Images[0]}
          alt={`Thumbnail for ${spot.Name}`}
          className={`absolute top-8 right-2 h-14 rounded-md transition-all duration-500
                      ${expanded ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
          style={{
            width: 'auto',
            height: '3.5rem',
            objectFit: 'contain',
            transitionProperty: 'opacity, transform',
          }}
        />
      )}

      <p
        className={`absolute right-1 top-2 text-xs text-gray-500 transition-all duration-500 
                    ${expanded && !isShrinking ? 'right-10' : 'right-1'} 
                    ${isShrinking ? 'transition-transform duration-500 translate-x-[-0px]' : ''}`}
        style={{ transition: 'right 0.5s ease, transform 0.5s ease' }}
      >
        {ExtraFunctions.getTimeAgo(spot.Time)}
      </p>

      <div className="flex justify-between items-center mb-1">
        <div className="sm:items-start">
          <p className="text-xl sm:text-2xl font-semibold">{spot.Name}</p>
          <p className="text-sm sm:text-base text-gray-500">{spot.nickname}</p>

          <div 
            className={`flex ${expanded && !isShrinking ? 'flex-wrap' : ''} gap-2 mt-2 flex-row`}
          >
            {exampleCategories.map((categoryName, index) => (
              <Category
                key={categoryName + index}
                name={categoryName}
                isVisible={(expanded && !isShrinking) || index == 0}
              />
            ))}
          </div>

        </div>
      </div>

      <TextWithReadMoreButton
        text={spot.Description}
        onReadMoreClick={handleSpotClick}
        spotClose={isShrinking}
        maxLength={50}
      />

      <div
        className={`transition-all duration-500 mt-1 ease-in-out overflow-hidden 
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
              style={{ transform: expanded && !isShrinking ? 'scale(1)' : 'scale(0)' }}
            />
          ))}
        </div>
      </div>

      <div
        className={`flex justify-between items-center mt-2 transition-opacity duration-500 ease-in-out ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
      >
       <div className="flex gap-2">

       <div className="flex gap-2">
          <button
            onClick={handleLikeClick}
            className="flex items-center justify-center w-16 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
            title={
              currentUser?.userID
                ? liked ? "Unlike" : "Like"
                : "You must be logged in to like"
            }
            disabled={!currentUser?.userID}
          >
            <FaHeart className={liked ? "text-red-600" : "text-gray-600"} />
            <span className="ml-2 text-sm font-semibold text-gray-600">{likesCount}</span>
          </button>

        </div>

          <button
            onClick={handleCommentClick}
            className={`flex items-center justify-center w-10 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
            title="View Comments"
            disabled={!expanded}
          >
            <FaComment className="text-gray-600 hover:text-blue-600" />
          </button>
        </div>

        <div className="flex">
          {spot.user_id === currentUser.userID && (
            <button
              onClick={handleEditClick}
              className={`flex items-center justify-center w-10 h-10 mr-2 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
              title="Edit"
              disabled={!expanded}
            >
              <FaEdit className="text-gray-600 hover:text-green-600" />
            </button>
          )}
          
          {spot.user_id === currentUser.userID && (
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
