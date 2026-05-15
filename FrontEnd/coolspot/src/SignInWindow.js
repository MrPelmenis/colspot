import React, { useContext, useState } from 'react';
import { WindowContext } from './WindowContext';

function SignInWindow() {
  const { windowStates } = useContext(WindowContext);
  const { updateWindowState } = useContext(WindowContext);

  const { email, visible } = windowStates.signInWindow;

  const [username, setUsername] = useState(""); // State to store the username

  if (!visible) return null; 

  const onClose = () => {
    updateWindowState('signInWindow', { email: "", visible: false });
    localStorage.setItem("JWT", "");
  }

  const handleSignInServer = () => {
    console.log("new client login: un:" + username + " email:" + windowStates.signInWindow.email); // Log the username and email
    updateWindowState('signInWindow', { email: "", visible: false });
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
  
      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
  
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Enter Username
      </label>
  
      <input
        type="text"
        maxLength="20"
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent transition-colors duration-300"
        placeholder="Nickname"
        value={username} // Controlled input value
        onChange={(e) => setUsername(e.target.value)} // Update username state
      />
  
      {/* Wrap the button in a flex container */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSignInServer}
          className="w-20 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Ok
        </button>
      </div>
    </div>
  );
}

export default SignInWindow;
