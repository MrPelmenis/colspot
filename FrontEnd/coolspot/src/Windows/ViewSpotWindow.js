import React, { useContext, useEffect, useState } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';

import { SpotsContext } from '../ContextProviders/SpotsContext';

import Spot from '../Spot';

function ViewSpotWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { visible } = windowStates.viewSpotWindow;

  const { getSingleSpotById, setSelectedSpotID, selectedSpotID, fetchSpots } = useContext(SpotsContext);

  const [spotInfo, setSpotInfo] = useState(null);

  useEffect(() => {
    if(visible){
        setSpotInfo(getSingleSpotById(selectedSpotID));
        //console.log("mans sptots kuru izvelejos:", getSingleSpotById(selectedSpotID));
    }
  }, [visible, selectedSpotID]);  

  const onClose = () => {
    setSpotInfo(null)
    updateWindowState('viewSpotWindow', { visible: false });
    fetchSpots();
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-20 
      transition-opacity transition-visibility duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClickOutside}
    >
      <div
        className={`relative bg-white rounded-lg shadow-lg z-100 
        w-11/12 sm:w-5/6 md:w-4/5 lg:w-1/2 xl:w-1/2 transform scale-95 opacity-0 transition-opacity duration-500 
        ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        
        {spotInfo ? (
           <Spot key={selectedSpotID} spot={spotInfo} isThisSpotSelected={true} closeWindow={onClose}/>
        ) : (
          <p className="text-gray-500 text-center">No spot details available.</p>
        )}
      </div>
    </div>
  );
}

export default ViewSpotWindow;
