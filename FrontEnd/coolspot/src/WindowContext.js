import React, { createContext, useState } from 'react';

export const WindowContext = createContext();

export const WindowProvider = ({ children }) => {
  const [windowStates, setWindowStates] = useState({
    signInWindow: { email: "", nickname: "", visible: false, jwt: '' },
    profileWindow: { email: "", nickname: "", visible: false },
    anotherWindow: { email: "", visible: false },
    deleteProfile: {nickname:"", visible:false},
    addSpotWindow:{ visible:false, nickname:"", email:"", geoLocation:""}
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
