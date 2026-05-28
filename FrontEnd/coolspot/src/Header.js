import React, { useContext, useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { HiOutlineMenu } from 'react-icons/hi'; // Importing the menu icon
import { jwtDecode } from 'jwt-decode';

import { WindowContext } from './ContextProviders/WindowContext';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { ExtraFunctions } from './ExtraFunctions';
import ProfileImage from './ProfileImage';

function Header() {
  const { updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser, fetchUserData } = useContext(CurrentUserContext);
  const [userEmail, setUserEmail] = useState("");

  const { windowStates } = useContext(WindowContext);
  const { visible } = windowStates.leaderboardWindow || {};

  let isLoggedIn = ExtraFunctions.isUserLoggedIn() && localStorage.getItem('JWT') != null;

  useEffect(() => {
    fetchUserData();
    isLoggedIn = ExtraFunctions.isUserLoggedIn() && localStorage.getItem('JWT') != null;
  }, []);

  const handleLoginSuccess = async (response) => {
    updateCurrentUser({ nickname: "", email: "", is_admin: false });
    const jwtToken = response.credential;
    const decodedToken = jwtDecode(jwtToken);
    const email = decodedToken.email;
    const nickname = decodedToken.name;

    setUserEmail(email);

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

    if (data.message === "User exists") {
      localStorage.setItem("JWT", jwtToken);
      fetchUserData();
    } else {
      fetchUserData();
      updateWindowState('signInWindow', { email: data.user.email, nickname: data.user.name, visible: true, jwt: jwtToken });
    }
  };

  const onProfileClick = () => {
    updateWindowState('profileWindow', { visible: true });
  };

  const menu = () => {
    updateWindowState('menuWindow', { visible: true });
  };

  return (
    <GoogleOAuthProvider clientId={window.websiteSetting.CLIENT_ID}>
      <header className="bg-gray-200 py-4 w-full flex justify-between items-center px-4 rounded-b-lg shadow-md sticky top-0 z-10">
        
      <button
        onClick={menu}
        className="mr-1 rounded-xl items-center transition duration-200 
                  sm:w-10 sm:h-10 w-8 h-8"
        title='Menu'
      >
        <HiOutlineMenu className="text-gray-800 sm:w-8 sm:h-8 w-6 h-6 hover:scale-105 transition-all duration-100" />
      </button>



        {/* CoolSpot Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-bold text-gray-800 flex-grow text-left">
          CoolSpot
        </h1>

        {/* Profile or Google Login */}
        {isLoggedIn ? (
          <div onClick={onProfileClick} title="View Profile" className="flex items-center mr-2 cursor-pointer">
            <h2
              className={`text-lg hidden sm:block ${currentUser.is_admin ? 'text-red-800 font-extrabold' : 'text-gray-800'} font-semibold ml-4`}
            >
              {currentUser.nickname}
            </h2>
            <ProfileImage nickname={currentUser.nickname} inSpot={false} w={12} h={12} />
          </div>
        ) : (
          <div className="scale-[0.8] sm:scale-100">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => alert('Login Failed')}
              ux_mode="popup"
              prompt="select_account"
              use_fedcm_for_prompt={false}
            />
          </div>
        )}
      </header>
    </GoogleOAuthProvider>
  );
}

export default Header;
