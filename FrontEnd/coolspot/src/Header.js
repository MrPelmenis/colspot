import React, { useContext, useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

import { WindowContext } from './ContextProviders/WindowContext';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';

import { ExtraFunctions } from './ExtraFunctions';


import ProfileImage from './ProfileImage'; 

function Header() {
  const { updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser, fetchUserData } = useContext(CurrentUserContext);
  const [userEmail, setUserEmail] = useState("");

  let isLoggedIn = (ExtraFunctions.isUserLoggedIn() && localStorage.getItem('JWT') != null) ? true : false;


  useEffect(()=>{
      //console.log("current user:", currentUser);
      //console.log((ExtraFunctions.isUserLoggedIn() && localStorage.getItem('JWT') != null) ? true : false);
  }, [currentUser])

  
  useEffect(() => {
    fetchUserData();
    isLoggedIn = ((ExtraFunctions.isUserLoggedIn() && localStorage.getItem('JWT') != null) ? true : false);
  }, []);
 

  const handleLoginSuccess = async (response) => {
    updateCurrentUser({nickname: "", email: "", is_admin: false});
    const jwtToken = response.credential;
    const decodedToken = jwtDecode(jwtToken);
    const email = decodedToken.email;
    const nickname = decodedToken.name;

    setUserEmail(email);
    //localStorage.setItem("JWT", jwtToken);

    const res = await fetch(`${window.websiteSetting.serverURL}/api/check_user`, {
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
      localStorage.setItem("JWT", jwtToken);
      fetchUserData();
    } else{
      //console.log("create");
      fetchUserData();
      updateWindowState('signInWindow', { email: data.user.email, nickname:data.user.name, visible: true, jwt: jwtToken});
    } 
  };


  const onProfileClick = () => {
    updateWindowState('profileWindow', {visible: true });
  }

  

  return (
    <GoogleOAuthProvider clientId={window.websiteSetting.CLIENT_ID}>
      <header className="bg-gray-200 py-4 w-full flex justify-between items-center px-4 rounded-b-lg shadow-md sticky top-0 z-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-bold text-gray-800 flex-grow text-left">
          CoolSpot
      </h1>
      {isLoggedIn ? (
          <div onClick={onProfileClick} title="View Profile" className="flex items-center mr-2 cursor-pointer">
            <h2
              className={`text-lg ${currentUser.is_admin ? 'text-red-800 font-extrabold' : 'text-gray-800'} font-semibold ml-4`}
            >
              {currentUser.nickname}
            </h2>
            <ProfileImage nickname={currentUser.nickname}></ProfileImage>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => alert('Login Failed')}
            useOneTap
            auto_select
          />
        )}
      </header>
    </GoogleOAuthProvider>
  );
}

export default Header;