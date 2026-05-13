import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MapDiv from './Map';
import SpotList from './SpotList';
import { useState } from 'react';


function App() {

  const [spots, setSpots] = useState([]);

  const addSpot = (newSpot) => {
    setSpots([...spots, newSpot]);  // Add new spot to the state
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 min-h-screen">
        <Header />
        <div className="flex flex-col gap-8 my-8">
          <MapDiv addSpot={addSpot} />
          <SpotList spots={spots} />
        </div>
        <Footer />
    </div>
  );
}

export default App;
