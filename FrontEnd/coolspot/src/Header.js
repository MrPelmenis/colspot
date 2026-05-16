import React, { useContext, useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode'; // Fix import to correctly decode

import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';

import { ExtraFunctions } from './ExtraFunctions';

function Header() {
  const { updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const jwtToken = localStorage.getItem('JWT');
    if (jwtToken) {
      try {
        const decodedToken = jwtDecode(jwtToken);
        if (currentUser.email !== decodedToken.email) {
          const userData = {
            username: decodedToken.name,
            email: decodedToken.email
          };
          updateCurrentUser(userData);;
        }
      } catch (error) {
        console.error('Invalid token');
        localStorage.removeItem('JWT'); 
      }
    }
  }, [currentUser.email, updateCurrentUser]);

  const handleLoginSuccess = async (response) => {
    try {
      // Decode JWT and update user info locally
      const jwtToken = response.credential;
      const decodedToken = jwtDecode(jwtToken);
      const email = decodedToken.email;
      const nickname = decodedToken.name;
  
      // Update current user and store token
      setUserEmail(email);
      localStorage.setItem("JWT", jwtToken);
      updateCurrentUser({ nickname, email });
  
      // Send POST request to update profile in the backend
      const res = await fetch("http://localhost:5000/api/update_profile", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Send email as part of the body
      });
  
      if (!res.ok) {
        throw new Error('Failed to fetch profile from the server.');
      }
  
      const data = await res.json(); // Ensure proper response handling
      console.log(data);
  
      // Update the state with the user's profile info if received
      if (data.nickname) {
        updateCurrentUser({
          nickname: data.nickname,
          email,
        });
      }
    } catch (error) {
      console.error('Error in login:', error);
    }
  };
  

  const onProfileClick = () => {
    updateWindowState('profileWindow', { email: "", visible: true });
  }

  const isLoggedIn = ExtraFunctions.isUserLoggedIn();

  return (
    <GoogleOAuthProvider clientId={"304862924981-o5ghsqptv2e8jjbkvli6cm0rov256ahv.apps.googleusercontent.com"}>
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
