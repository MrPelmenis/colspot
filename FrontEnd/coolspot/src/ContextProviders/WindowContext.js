import React, { createContext, useState } from 'react';
import EditSpotWindow from '../Windows/EditSpotWindow';
import LeaderboardWindow from '../Windows/LeaderboardWindow';

export const WindowContext = createContext();

export const WindowProvider = ({ children }) => {
  const [windowStates, setWindowStates] = useState({
    signInWindow: { email: "", nickname: "", visible: false, jwt: '' },
    profileWindow: { email: "", nickname: "", visible: false },
    anotherWindow: { email: "", visible: false },
    deleteProfile: {nickname:"", visible:false},
    deleteSpot: {spotID:"", visible:false},
    editSpotWindow: {visible:false, spotToEdit: null},
    addSpotWindow:{ visible:false, nickname:"", email:"", geoLocation:""},
    deleteCommentWindow:{visible:false, commentID: null},
    viewSpotWindow:{visible:false},
    viewImageWindow :{visible:false, imageSRC: null},
    viewProfileWindow: { visible: false, nickname: "" },
    leaderboardWindow: { visible: false },
    menuWindow: { visible: false },
    aboutWindow: {visible:false},
    termsOfServiceWindow: {visible:false},
  });

  const updateWindowState = (windowName, newState) => {
    setWindowStates((prevState) => ({
      ...prevState,
      [windowName]: {
        ...prevState[windowName],
        ...newState
      }
    }));
  };

  return (
    <WindowContext.Provider value={{ windowStates, updateWindowState }}>
      {children}
    </WindowContext.Provider>
  );
};
