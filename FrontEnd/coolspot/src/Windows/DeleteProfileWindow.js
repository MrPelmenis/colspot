import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';


import { SpotsContext } from '../ContextProviders/SpotsContext';
function DeleteProfileWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

  const { fetchSpots } = useContext(SpotsContext);

  const { visible, nickname } = windowStates.deleteProfile;
  const [confirmationText, setConfirmationText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [requiredNumbers, setRequiredNumbers] = useState('');

  // Function to generate random numbers
  const generateRandomNumbers = () => {
    return Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  };

  // Sync the confirmation input and generate new random numbers when the window becomes visible
  useEffect(() => {
    if (visible) {
      setConfirmationText('');
      setErrorMessage('');
      setRequiredNumbers(generateRandomNumbers()); // Generate new random numbers
    }
  }, [visible]);

  const onClose = () => {
    updateWindowState('deleteProfile', { visible: false });
  };

  const handleDeleteProfile = async () => {
    if (confirmationText !== requiredNumbers) {
      setErrorMessage(`Please type the exact sequence of numbers above`); 
      return;
    }

    const jwtToken = localStorage.getItem('JWT');

    try {
      const res = await fetch('/api/users/' + currentUser.userID, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        //body: JSON.stringify({ user_id: currentUser.userID }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete profile');
      }

      updateCurrentUser({ email: '', nickname: '', description: '', userID: null });
      localStorage.removeItem('JWT');
      updateWindowState('deleteProfile', { visible: false });
      updateWindowState('profileWindow', { visible: false });
      
      //lai paradas ka deletotam uuserim ir sis spots :D
      fetchSpots();


    } catch (error) {
      console.error('Error deleting profile:', error);
      setErrorMessage('An error occurred while deleting your profile.');
    }
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

      <h2 className="text-2xl font-bold mb-4 text-center">Delete Profile</h2>

      <p className="mb-4 text-gray-800">
        Are you sure you want to delete your profile: <br/> <span className="font-bold">{nickname}</span>?  <br/>
        All your amazing spots will be permanently deleted aswell. <br/>
        This action cannot be undone.
      </p>

      <label className="block mb-2 text-sm font-medium text-gray-700">
        To confirm, please type the following sequence of numbers:
        <span className="font-bold"> {requiredNumbers}</span>
      </label>

      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                   focus:border-transparent transition-colors duration-300"
        placeholder='Type the numbers here...'
        value={confirmationText}
        onChange={(e) => setConfirmationText(e.target.value)}
      />

      {errorMessage && (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="mr-4 bg-gray-300 text-black px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteProfile}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors"
        >
          Confirm Delete
        </button>
      </div>
    </div>
  </div>
  );
}

export default DeleteProfileWindow;
