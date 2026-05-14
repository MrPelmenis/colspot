import React, { useContext, useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';

import { ExtraFunctions } from './ExtraFunctions';

function Header() {
  const { updateWindowState } = useContext(WindowContext);

  const { currentUser } = useContext(CurrentUserContext);
  const { updateCurrentUser } = useContext(CurrentUserContext);

  const [userEmail, setUserEmail] = useState("");


  const fetchUserData = () => {
    // Simulate fetching user data (replace this with your API call)
    return {
      username: 'john_doe',
      email: 'john@example.com'
    };
  };

  useEffect(() => {
    const userData = fetchUserData();
    updateCurrentUser(userData); 
  }, []);



  const handleLoginSuccess = (response) => {
    const jwtToken = response.credential;

    const decodedToken = jwtDecode(jwtToken); 
    setUserEmail(decodedToken.email);
    localStorage.setItem("JWT", jwtToken);

    updateWindowState('signInWindow', { email: userEmail, visible: true });
  };


  const onProfileClick = ()=>{
    updateWindowState('profileWindow', { email: "", visible: true });
  }

  const isLoggedIn = ExtraFunctions.isUserLoggedIn(); // Check if user is logged in

  return (
    <GoogleOAuthProvider clientId="304862924981-o5ghsqptv2e8jjbkvli6cm0rov256ahv.apps.googleusercontent.com">
      <header className="bg-gray-200 py-4 w-full flex justify-between items-center px-4 rounded-b-lg shadow-md sticky top-0 z-10">
        <h1 className="text-4xl font-bold text-gray-800 flex-grow text-center md:text-left">CoolSpot</h1>
        {isLoggedIn ? (
          <div className="flex items-center">
            <h2 onClick={onProfileClick} className="text-lg text-gray-800 font-semibold ml-4">{currentUser.username}</h2>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => alert('Login Failed')}
          />
        )}
      </header>
    </GoogleOAuthProvider>
  );
}

export default Header;
