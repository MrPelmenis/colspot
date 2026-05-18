import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';

function SignInWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

  const { email, nickname, visible } = windowStates.signInWindow;
  const jwt = windowStates.signInWindow.jwt;

  const [username, setUsername] = useState(windowStates.signInWindow.nickname);
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [showTOS, setShowTOS] = useState(false); // State to toggle TOS visibility

  // Sync the username state with the nickname whenever it changes
  useEffect(() => {
    setUsername(nickname || '');
    setErrorMessage(''); // Reset error message when nickname changes
  }, [nickname]);

  useEffect(() => {}, [visible]);

  if (!visible) return null;

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

    const res = await fetch('/api/create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname: username, email: email }),
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();

    if (data.message === 'took') {
      setErrorMessage('Choose another nickname, this one is taken'); // Set error message
      return;
    }

    localStorage.setItem('JWT', jwt);
    updateCurrentUser({ ...currentUser, nickname: username, email: email });
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
    setShowTOS(!showTOS); // Toggle the visibility of the TOS section
  };

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-100
                 w-2/3 md:w-1/2 lg:w-1/3"
      style={{ zIndex: 100 }}
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
        value={username} // Controlled input value
        onChange={handleUsernameChange} // Updated onChange handler
      />

      {errorMessage && ( // Conditionally render error message
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

      {showTOS && ( // Conditionally render TOS text
        <div className="mt-4 text-gray-700 border p-4 rounded-lg" style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
          <h3 className="text-lg font-bold mb-2">Terms of Service</h3>
          <p>
            Upon initiation of your account, you hereby enter into an irrevocable and perpetual agreement with us, valid for the entirety of your natural lifespan (and potentially beyond). All data transmitted to our servers will be retained indefinitely, in accordance with our stringent data conservation protocols. The concept of "profile deletion" is scientifically obsolete within our framework; the only available recourse is the modification or partial rectification of your existing data.
          </p>
          <p>
            By creating an account, you are effectively consenting to a lifelong contract—terminable only by your biological cessation. However, even post-mortem, your profile will persist in our secure database, ensuring the continued preservation of your digital footprint for an indefinite temporal span. We appreciate your cooperation in this eternal endeavor.
          </p>
        </div>
      )}

    </div>
  );
}

export default SignInWindow;
