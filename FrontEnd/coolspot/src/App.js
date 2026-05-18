import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MapDiv from './Map';
import SpotList from './SpotList';
import { WindowProvider } from './WindowContext';
import { CurrentUserProvider } from './CurrentUserContext';
import SignInWindow from './SignInWindow';
import ProfileWindow from './ProfileWindow';
import DeleteProfileWindow from './DeleteProfileWindow';
import AddSpotWindow from './AddSpotWindow';

function App() {
  const [token, setToken] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); // To track if the user is logged in

  return (
    <CurrentUserProvider>
      <WindowProvider>
        <div className="flex flex-col items-center bg-gray-800 min-h-screen">
          <SignInWindow />
          <ProfileWindow />
          <DeleteProfileWindow/>
          <AddSpotWindow/>
          <Header />
          <div className="flex flex-col gap-8 my-8">
            <MapDiv/>
            <SpotList/>
          </div>
          <Footer />
        </div>
      </WindowProvider>
    </CurrentUserProvider>
  );
}

export default App;
