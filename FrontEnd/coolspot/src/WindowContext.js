import React, { createContext, useState } from 'react';

export const WindowContext = createContext();

export const WindowProvider = ({ children }) => {
  const [windowStates, setWindowStates] = useState({
    signInWindow: { email: "example1@gmail.com", visible: false },
    profileWindow: { email: "", visible: false },
    anotherWindow: { email: "", visible: false }
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
