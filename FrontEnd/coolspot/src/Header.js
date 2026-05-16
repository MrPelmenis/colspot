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
    // try {
    //   const response = await fetch('http://localhost:5000/api/update_user_profile');
    //   const data = await response.json();
    //   console.log(data);
    // } catch (error) {
    //   console.error('error getting shit', error);
    // }

    updateCurrentUser({nickname: "", email: ""});
    const jwtToken = response.credential;
    const decodedToken = jwtDecode(jwtToken);
    const email = decodedToken.email;
    const nickname = decodedToken.name;

    setUserEmail(email);
    localStorage.setItem("JWT", jwtToken);
    const res = await fetch("http://localhost:5000/api/update_profile", 
      {
        method: 'POST',  // Change to POST since you're sending data
        headers: {
            'Content-Type': 'application/json',  // Set content type as JSON
        },
        body: JSON.stringify(jwtDecode(jwtToken))  // Send JWT in request body
    }
    );
    
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data);

    // if (!res.ok) {
    //   throw new Error('Network response was not ok');
    // }

    // const data = await res.json();
    // console.log("tas kas no servera atnak:");
    // console.log(data);
    

    // if(data.message == "User exists"){
    //   console.log("exists");
    //   updateCurrentUser({nickname: data.user.nickname, email: data.user.email});
    // } else{
    //   updateCurrentUser({nickname: data.user.name, email: data.user.email});
    //   updateWindowState('signInWindow', { email: data.user.email, nickname:data.user.name, visible: true });
    // }  
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
