import React, { useState } from 'react';
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
import { SpotsProvider } from './SpotsContext';

function App() {
  const [token, setToken] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <CurrentUserProvider>
      <WindowProvider>
        <SpotsProvider> {/* Providing spots context to all components */}
          <div className="flex flex-col items-center bg-gray-800 min-h-screen">
            <SignInWindow />
            <ProfileWindow />
            <DeleteProfileWindow />
            <AddSpotWindow />
            <Header />
            <div className="flex flex-col gap-8 my-8">
              <MapDiv />
              <SpotList /> {/* SpotList now fetches and renders spots using context */}
            </div>
            <Footer />
          </div>
        </SpotsProvider>
      </WindowProvider>
    </CurrentUserProvider>
  );
}

export default App;
