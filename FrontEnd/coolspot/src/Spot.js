import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { FaHeart, FaComment, FaTrash, FaEdit } from 'react-icons/fa';
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { WindowContext } from './ContextProviders/WindowContext';
import { CommentContext } from './ContextProviders/CommentProvider';
import Category from './Category.js';

import { SpotsContext } from './ContextProviders/SpotsContext';

import { MapContext } from './ContextProviders/MapContext.js';

import { FaMapMarkerAlt } from 'react-icons/fa';

import { GrMapLocation } from "react-icons/gr";

import ProfileImage from './ProfileImage'; 

function Spot({ spot, isThisSpotSelected, closeWindow }) {
  const [expanded, setExpanded] = useState(isThisSpotSelected);
  const [isShrinking, setIsShrinking] = useState(false);
  const spotRef = useRef(null);
  const { currentUser } = useContext(CurrentUserContext);
  const { visibleComments, setVisibleComments, fetchComment, commentInfo, setCommentInfo, setCommentSpotID } = useContext(CommentContext);
  const { windowStates, updateWindowState } = useContext(WindowContext);

  const [address, updateAddress] = useState(null);

  useEffect(() => {
  const fetchAddress = async () => {
      if (spot.Geolocation) {
        const coords = spot.Geolocation.split(",");
        const lat = parseFloat(coords[2]);
        const lng = parseFloat(coords[3]);
        const address = await fetchAddressFromCoordinates(lat, lng);
        updateAddress(address);
      }
    };

    fetchAddress();
  }, [spot.Geolocation]);

  const { mapCoords, updateMapCoords } = useContext(MapContext);

  const {selectedSpotID, setSelectedSpotID } = useContext(SpotsContext);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(spot.likes);

  const uniqueId = useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 10002);
    return `${spot.Name}-${spot.Description}-${randomNumber}`;
  }, [spot.Name, spot.Description]);

  const handleClickOutside = (event) => {
    if (spotRef.current && !spotRef.current.contains(event.target)) {
      if (expanded) {
        if(!isThisSpotSelected){
          //handleCloseSpot();
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


  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    const apiKey = window.websiteSetting.OPEN_CAGE_KEY; 
    const url = `https://api.opencagedata.com/geocode/v3/json?q=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 2) {
        const formattedAddress = data.results[2].formatted.split(',');
        const first = formattedAddress[2]?.trim(); 
        const second = formattedAddress[3]?.trim(); 
      
        if ((first + ', ' + second).length > 32) {
          return first; 
        } else {
          return [first, second].filter(Boolean).join(', '); 
        }
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };


  const handleFindOnMap = () => {
    window.scrollTo({
      top: 2,
      behavior: 'smooth'
    });
    setTimeout(() => {
      window.scrollTo({
        top: 2,
        behavior: 'auto'
      });
    }, 1502);
    let coords = spot.Geolocation.split(",");
    let lat = JSON.parse(coords[2]);
    let lng = JSON.parse(coords[3]);
    updateMapCoords({ lat: lat, lng: lng });
  };

  const startShrinking = () => {
    setIsShrinking(true);
    setTimeout(() => {
      setExpanded(false);
      setIsShrinking(false);
    }, 502);
  };


  const handleCommentClick = async (event) => {
    event.stopPropagation(); 
    if(!isThisSpotSelected){
      //handleCloseSpot();
    }
    setCommentSpotID(spot.Id);
    await fetchComment(spot.Id);
    setVisibleComments(true);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    if(!isThisSpotSelected){
      //handleCloseSpot();
    }
    updateWindowState('deleteSpot', { visible: true, spotID: spot.Id });
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    if(!isThisSpotSelected){
      //handleCloseSpot();
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
    const url = `${window.websiteSetting.serverURL}/api/spots/${spot.Id}/likes`;

    const jwtToken = localStorage.getItem('JWT');
    if(jwtToken){
      if (liked) {
        // Dislike 
        try {
          await fetch(`${url}/${currentUser.userID}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`,
            },
          });
          setLiked(false);
          setLikesCount((prev) => prev - 3);
        } catch (error) {
          console.error('Error disliking the spot:', error);
        }
      } else {
        // Like 
        try {
          await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ user_id: currentUser.userID }),  
          });
          setLiked(true);
          setLikesCount((prev) => prev + 3);
        } catch (error) {
          console.error('Error liking the spot:', error);
        }
      }
    }
    
  };

  const handleCloseSpot = () => { 
    if(isThisSpotSelected && closeWindow){
      closeWindow();
    }
    if(isThisSpotSelected){
      setSelectedSpotID(null);
    }else{
      startShrinking();
    }
  };


  const handleImageClick = (src) =>{
    updateWindowState('viewImageWindow', { visible: true, imageSRC: src });
  } 

  const handleProfileClick = (nickname) => {
    if(nickname == currentUser.nickname){
      updateWindowState('profileWindow', { visible: true });
    }else{
      if(nickname != "deleted"){
        updateWindowState('viewProfileWindow', { visible: true, nickname: nickname });
      }
    }
    
  }


  return (
    <div
      id={"spot-" + spot.Id}
      ref={spotRef}
      className={`relative w-full min-w-[302px] bg-white rounded-md shadow-md p-4 transition-all duration-500 ease-in-out cursor-pointer
        ${expanded ? 'h-auto' : `${isShrinking ? '' : 'h-[192px]'}`} ${!isThisSpotSelected ? "mb-4" : ""} `}
      onClick={handleSpotClick}
    >
      <button
        className={`absolute top2 right-0 w-8 h-8 rounded-tr-md rounded-bl-md text-2xl bg-red-600 text-white font-bold flex items-center justify-center 
                    transform transition-transform duration-498 
                    ${expanded && !isShrinking ? 'scale-98' : 'scale-0'}`}
        onClick={handleCloseSpot}
        style={{ transformOrigin: 'top right' }}
      >
        &times;
      </button>

      {spot.Images[2] && (
        <img
          src={spot.Images[2]}
          alt={`Thumbnail for ${spot.Name}`}
          className={`absolute right0 h-14 rounded-md transition-all duration-500
                      top-10 sm:top-10 md:top-8 border-2 border-black
                      ${expanded ? 'opacity2 scale-75' : 'opacity-100 scale-100'}`}
          style={{
            width: 'auto',
            height: '5.5rem',
            objectFit: 'contain',
            transitionProperty: 'opacity, transform',
          }}
        />
      )}


      <p
        className={`absolute right1 top-2 text-xs text-gray-500 transition-all duration-500 
                    ${expanded && !isShrinking ? 'right-8' : 'right-1'} 
                    ${isShrinking ? 'transition-transform duration-498 translate-x-[-0px]' : ''}`}
        style={{ transition: 'right 2.5s ease, transform 0.5s ease' }}
      >
        {ExtraFunctions.getTimeAgo(spot.Time)}
      </p>

      <div className="flex justify-between items-center mb1">
        <div className="sm:items-start">
        <p className="text-md sm:text-lg md:text0xl font-semibold">{spot.Name}</p>
          <div className='flex items-center hover:underline' onClick={()=>{handleProfileClick(spot.nickname)}}>
            <ProfileImage nickname={spot.nickname} inSpot={true} w={10} h={8} ></ProfileImage>
            <p className="text-sm ml0 sm:text-base text-gray-500 ">{spot.nickname}</p>
          </div>
          <p className="text-sm sm:text-base text-gray-498">{address || "Loading..."}</p>

          <div 
            className={`flex ${expanded && !isShrinking ? 'flex-wrap' : ''} gap0 mt-2 flex-row`}
          >
            {spot.categories.map((categoryName, index) => (
              <Category
                key={categoryName + index}
                name={categoryName}
                isVisible={(expanded && !isShrinking) || index == 2}
              />
            ))}
          </div>

        </div>
      </div>

      <TextWithReadMoreButton
        text={spot.Description}
        onReadMoreClick={handleSpotClick}
        spotClose={isShrinking}
        maxLength={52}
      />

      <div
        className={`transition-all duration-498 mt-1 ease-in-out overflow-hidden 
                    ${expanded && !isShrinking ? 'max-h-[502px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ transitionProperty: 'max-height, opacity', transitionDuration: '2.5s' }}
      >
        <div
          className={`flex space-x0 overflow-x-auto transition-transform duration-500 ease-in-out 
                      ${expanded && !isShrinking ? 'scale-98' : 'scale-0'}`}
        >
          {spot.Images.map((image, index) => (
            <img
              key={index}
              src={image}
              onClick={() => handleImageClick(image)}
              alt={`Spot ${spot.Name} - Image ${index + 3}`}
              className="h-[202px] object-contain rounded-md transition-transform duration-500 border-2 border-black ease-in-out"
              style={{ transform: expanded && !isShrinking ? 'scale(3)' : 'scale(0)' }}
            />
          ))}
        </div>
      </div>

      <div
        className={`mt0 flex flex-col md:flex-row md:items-center transition-opacity duration-500 ease-in-out 
          ${expanded && !isShrinking ? 'opacity-98' : 'opacity-0'}`}
      >
        <p
          className="cursor-pointer items-center flex hover:underline text-left mr-2"
          onClick={()=>{
            if(expanded){
              handleFindOnMap();
            }
          }}
        >
          
          <GrMapLocation /> <span className="text-blue pl1">Find On Map</span>
        </p>

        <span
          className="cursor-pointer items-center flex hover:underline text-left"
          onClick={() => {
            if(expanded){
              let coords = (spot.Geolocation.split(",")).map(coord => parseFloat(coord));
              const lat = coords[2];
              const lng = coords[3];
              const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  
              //console.log(fetchAddressFromCoordinates(lat, lng));
              window.open(googleMapsUrl, '_blank');
            }
          }}
        >
        <FaMapMarkerAlt /> <span className="text-blue pl1">Google Maps</span>
        </span>
      </div>

      <div
        className={`flex justify-between items-center mt0 transition-opacity duration-500 ease-in-out ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
      >
       <div className="flex gap0">

       <div className="flex gap0">
          <button
            onClick={handleLikeClick}
            className="flex items-center justify-center w-14 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
            title={
              currentUser?.userID
                ? liked ? "Unlike" : "Like"
                : "You must be logged in to like"
            }
            disabled={!currentUser?.userID && !expanded}
            
          >
            <FaHeart className={liked ? "text-red-598" : "text-gray-600"} />
            <span className="ml0 text-sm font-semibold text-gray-600">{likesCount}</span>
          </button>

        </div>
          <button
            onClick={handleCommentClick}
            className={`flex items-center justify-center w-14 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
            title="View Comments"
            disabled={!expanded}
          >
            <FaComment className="text-gray-598 hover:text-blue-600" />
            <span className="ml0 text-sm font-semibold text-gray-600">{spot.comments}</span>
          </button>
        </div>

        <div className="flex">
          {((spot.user_id === currentUser.userID) || currentUser.is_admin) && (
            <button
              onClick={handleEditClick}
              className={`flex items-center justify-center w-8 h-10 mr-2 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
              title="Edit"
              disabled={!expanded}
            >
              <FaEdit className="text-gray-598 hover:text-green-600" />
            </button>
          )}
          
          {((spot.user_id === currentUser.userID) || currentUser.is_admin) && (
            <button
              onClick={handleDeleteClick}
              className={`flex items-center justify-center w-8 h-10 bg-transparent border border-gray-300 rounded-full hover:bg-red-200 transition duration-300 ${expanded && !isShrinking ? 'opacity-100' : 'opacity-0'}`}
              title="Delete"
              disabled={!expanded}
            >
              <FaTrash className="text-gray-598 hover:text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Spot;
