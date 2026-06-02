import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';

function SignInWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser, fetchUserData } = useContext(CurrentUserContext);

  const { email, nickname, visible } = windowStates.signInWindow;
  

  const [username, setUsername] = useState(windowStates.signInWindow.nickname);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showTOS, setShowTOS] = useState(false); 

  useEffect(() => {
    setUsername(nickname || '');
    setErrorMessage(''); 
  }, [nickname]);

  useEffect(() => {}, [visible]);


  const onClose = () => {
    updateWindowState('signInWindow', { email: '', visible: false });
    updateCurrentUser({ nickname: '', description: '', email: '' });
    localStorage.setItem('JWT', '');
  };

  const handleSignInServer = async () => {
    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long');
      return;
    }

    const jwtToken =  windowStates.signInWindow.jwt;


    const res = await fetch(`${window.websiteSetting.serverURL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ nickname: username, email: email }),
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();

    if (data.message === 'took') {
      setErrorMessage('Choose another nickname, this one is taken');
      return;
    }

    //console.log(data);

    localStorage.setItem('JWT', jwtToken);
    fetchUserData();
    updateWindowState('signInWindow', { email: '', nickname: '', visible: false, jwt: '' });
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    if (value.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long');
    } else {
      setErrorMessage('');
    }
  };

  const toggleTOS = () => {
    setShowTOS(!showTOS);
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

      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

      <label className="block mb-2 text-sm font-medium text-gray-700">Enter Nickname</label>

      <input
        type="text"
        maxLength="20"
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent transition-colors duration-300"
        placeholder="Nickname"
        value={username} 
        onChange={handleUsernameChange}
      />

      {errorMessage && ( 
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}

      <div className="flex justify-between mt-2">
        <div onClick={toggleTOS} className="text-sm hover:underline m-auto hover:cursor-pointer ml-0">
          {showTOS ? 'Hide Terms Of Service' : 'Show Terms Of Service'}
        </div>

        <button
          onClick={handleSignInServer}
          className="w-25 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Sign Up
        </button>
      </div>

      {showTOS && ( 
        <div className="mt-4 text-gray-700 border p-4 rounded-lg" style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
          <h3 className="text-lg font-bold mb-2">Terms of Service</h3>
          {window.websiteSetting.TOS}

        </div>
      )}

    </div>
  </div>
  );
}

export default SignInWindow;
