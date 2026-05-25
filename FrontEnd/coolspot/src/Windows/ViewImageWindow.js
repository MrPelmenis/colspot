import React, { useContext } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';

function ViewImageWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);

  const { visible, imageSRC } = windowStates.viewImageWindow;

  const onClose = () => {
    updateWindowState('viewImageWindow', { visible: false, imageSRC: null });
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 
      transition-opacity transition-visibility duration-500 ${(visible && imageSRC)  ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClickOutside}
    >
      <div
        className={`relative z-100 
        transform scale-95 opacity-0 transition-opacity duration-500 
        ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <button
          className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
          style={{ width: '30px', height: '30px' }}
          onClick={onClose}
        >
          &times;
        </button>

        {imageSRC && (
          <img
            src={imageSRC}
            alt="Viewing"
            className="max-w-full max-h-screen object-contain rounded-lg"
          />
        )}
      </div>
    </div>
  );
}

export default ViewImageWindow;