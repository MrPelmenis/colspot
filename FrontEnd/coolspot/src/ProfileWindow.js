import React, { useContext } from 'react';
import { WindowContext } from './WindowContext';
import { ExtraFunctions } from './ExtraFunctions';

import { CurrentUserContext } from './CurrentUserContext';


function ProfileWindow() {
  const { windowStates } = useContext(WindowContext);
  const { updateWindowState } = useContext(WindowContext);

  const { currentUser } = useContext(CurrentUserContext);
  const { updateCurrentUser } = useContext(CurrentUserContext);

  const { email, visible } = windowStates.profileWindow;

  if (!visible) return null; 

  const onClose = ()=>{
    updateWindowState('profileWindow', { email: "", visible: false });
  }


  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-100
                 w-2/3 md:w-1/2 lg:w-1/3" // Wider on smaller screens
      style={{ zIndex: 100 }}
    >
      <button
        className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
        style={{ width: '30px', height: '30px' }}
        onClick={onClose}
      >
        &times;
      </button>
  
      <h2 className="text-2xl font-bold mb-4 text-center">{currentUser.username}</h2>
  
      <div className="flex justify-end mt-2">
        <button
          className="w-20 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Ok
        </button>

      </div>
    </div>
  );
}

export default ProfileWindow;
