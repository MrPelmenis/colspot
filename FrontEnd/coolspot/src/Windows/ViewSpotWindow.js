import React, { useContext } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';

function ViewSpotWindow({ Spot }) {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { visible, spot } = windowStates.viewSpotWindow;

  const onClose = () => {
    updateWindowState('viewSpotWindow', { visible: false, spot: null });
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 
      transition-opacity transition-visibility duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClickOutside}
    >
      <div
        className={`relative bg-white p-6 rounded-lg shadow-lg z-100 
        w-11/12 sm:w-5/6 md:w-4/5 lg:w-1/2 xl:w-1/3 transform scale-95 opacity-0 transition-opacity duration-500 
        ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <button
          className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
          style={{ width: '30px', height: '30px' }}
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Spot Details</h2>

        {/* Render Spot component here */}
        {spot ? (
          <Spot spotData={spot} />
        ) : (
          <p className="text-gray-500 text-center">No spot details available.</p>
        )}
      </div>
    </div>
  );
}

export default ViewSpotWindow;
