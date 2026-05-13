import React, { useContext } from 'react';

import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from "@react-oauth/google";

import { jwtDecode } from 'jwt-decode';

import { WindowContext } from './WindowContext';



function Header() {
  const { updateWindowState } = useContext(WindowContext); // Access the update function

  const handleLoginSuccess = (response) => {
    const jwtToken = response.credential;

    const decodedToken = jwtDecode(jwtToken); 
    const userEmail = decodedToken.email;
    console.log(userEmail);
    // Save the JWT token to local storage
    localStorage.setItem("JWT", jwtToken);

    // Update signInWindow's state (email and visibility)
    updateWindowState('signInWindow', { email: userEmail, visible: true });
  };

  return (
    <GoogleOAuthProvider clientId="304862924981-o5ghsqptv2e8jjbkvli6cm0rov256ahv.apps.googleusercontent.com">
      <header className="bg-gray-200 py-4 w-full flex justify-between items-center px-4 rounded-b-lg shadow-md sticky top-0 z-10">
        <h1 className="text-4xl font-bold text-gray-800 flex-grow text-center md:text-left">CoolSpot</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => alert('Login Failed')}
        />
      </header>
    </GoogleOAuthProvider>
  );
}

export default Header;
