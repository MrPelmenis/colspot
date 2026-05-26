import React, { createContext, useState } from 'react';
import { ExtraFunctions } from '../ExtraFunctions';
import {jwtDecode} from 'jwt-decode';


export const CurrentUserContext = createContext();


export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    id: "",
    nickname: '',
    email: '',
    description: '',
    profile_pic: "",
    is_admin: false,
  });

  const fetchUserData = async () => {
    const jwtToken = localStorage.getItem('JWT');
    
    if (ExtraFunctions.isUserLoggedIn() && jwtToken) {
      try {
        const decodedToken = jwtDecode(jwtToken);
        const email = decodedToken.email;

        //skatos kaads ir users
        const res = await fetch(`${window.websiteSetting.serverURL}/api/update_profile`, {
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
        //console.log("kaads ir mans useris: ", data);
        //console.log(data);
        const userData = {
          userID: data.user_id,
          nickname: data.nickname,
          email: data.email || email, 
          description: data.description,
          profile_pic: data.profile_pic,
          is_admin: data.is_admin == 1 ? true : false,  
        };

        updateCurrentUser(userData);
        return {result:true, message: "Safe"};

      } catch (error) {
        console.error('Error fetching user data:', error);
        updateCurrentUser({});
        localStorage.removeItem('JWT');  // Remove invalid JWT
        return {result:false, message: "Error fetching user data"};
      }
    }
  };
  


  const updateCurrentUser = (userData) => {
    setCurrentUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  return (
    <CurrentUserContext.Provider value={{ currentUser, updateCurrentUser, fetchUserData }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
