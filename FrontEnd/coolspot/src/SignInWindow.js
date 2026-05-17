import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';

function SignInWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

  const { email, nickname, visible } = windowStates.signInWindow;

  const [username, setUsername] = useState(nickname); 

  // Sync the username state with the nickname whenever it changes
  useEffect(() => {
    setUsername(nickname || '');
  }, [nickname]);

  if (!visible) return null; 

  const onClose = () => {
    updateWindowState('signInWindow', { email: "", visible: false });
    updateCurrentUser({nickname: '', email: ''});
    localStorage.setItem("JWT", "");
  }

  const handleSignInServer = async () => {
    //console.log(windowStates.signInWindow);
    console.log(" nickname:", username)
    console.log( email)
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
        console.log(data, data.message)
      if (data.message == "took"){
          alert("Choose other nickname, this one is taken")
      
          return;
      }
    //console.log(data);

    //alert("seit jaatuuta uz serveri kip requests ka jauns users sign up, un iedot vinam nickname ko vins ievadija un atsutit atpakal un tad frontend var nomainiit userename uz to kas ir");
    //console.log("new client login: un:" + username + " email:" + windowStates.signInWindow.email); 
    updateWindowState('signInWindow', { email: "", nickname:'', visible: false });
  }

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
