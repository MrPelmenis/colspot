import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import MapDiv from './Map';
import SpotList from './SpotList';
import { WindowProvider } from './WindowContext'; // Import only the provider
import SignInWindow from './SignInWindow';
function App() {
  const [spots, setSpots] = useState([]);

  const addSpot = (newSpot) => {
    setSpots([...spots, newSpot]); // Add new spot to the state
  };

  return (
    <WindowProvider>
      <div className="flex flex-col items-center bg-gray-800 min-h-screen">
        <SignInWindow />
        <Header />
        <div className="flex flex-col gap-8 my-8">
          <MapDiv addSpot={addSpot} />
          <SpotList spots={spots} />
        </div>
        <Footer />
      </div>
    </WindowProvider>
  );
}

export default App;
