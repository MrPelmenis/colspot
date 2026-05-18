import React, { useContext, useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';

import { ExtraFunctions } from './ExtraFunctions';

function Header() {
  const { updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const jwtToken = localStorage.getItem('JWT');
      
      if (jwtToken) {
        try {
          const decodedToken = jwtDecode(jwtToken);
          const email = decodedToken.email;
  
          //skatos kaads ir users
          const res = await fetch('/api/update_profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ email }),
          });
  
          if (!res.ok) {
            throw new Error('Failed to fetch user profile');
          }
  
          // Get the server's response
          const data = await res.json();
          console.log("Response from server:", data);
  
          const userData = {
            username: data.nickname,
            email: data.email || email, 
            description: data.description,  
          };

          updateCurrentUser(userData);

        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('JWT');  // Remove invalid JWT
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    //console.log("currentUser after state update:", currentUser);
  }, [currentUser]);

  const handleLoginSuccess = async (response) => {
    updateCurrentUser({nickname: "", email: ""});
    const jwtToken = response.credential;
    const decodedToken = jwtDecode(jwtToken);
    const email = decodedToken.email;
    const nickname = decodedToken.name;

    setUserEmail(email);
    localStorage.setItem("JWT", jwtToken);

    const res = await fetch('/api/check_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ email, nickname }),
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();
    //console.log("tas kas no servera atnak:");
    //console.log(data.user);
    

    if(data.message == "User exists"){
      //console.log("exists");
      updateCurrentUser({
        username: data.user.nickname, 
        description: data.user.description, 
        email: data.user.email
      });
    } else{
      //console.log("create");
      updateCurrentUser({
        username: data.user.name, 
        description: data.user.description, 
        email: data.user.email
      });
      updateWindowState('signInWindow', { email: data.user.email, visible: true });
    } 
  };

  const onProfileClick = () => {
    //console.log("currentUser:");
    //console.log(currentUser);
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