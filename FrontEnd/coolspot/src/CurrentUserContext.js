import React, { createContext, useState } from 'react';


export const CurrentUserContext = createContext();


export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    username: '',
    email: '',
  });

  const updateCurrentUser = (userData) => {
    setCurrentUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  return (
    <CurrentUserContext.Provider value={{ currentUser, updateCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
