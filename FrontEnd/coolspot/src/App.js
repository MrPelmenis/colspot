import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MapDiv from './Map';
import SpotList from './SpotList';
import { WindowProvider } from './WindowContext';
import SignInWindow from './SignInWindow';

function App() {
  const [spots, setSpots] = useState([]);

  // Fetch spots data from the Flask API
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/spots');
        const data = await response.json();
        setSpots(data);
      } catch (error) {
        console.error('Error fetching spots:', error);
      }
    };

    fetchSpots();
  }, []);

  const addSpot = (newSpot) => {
    setSpots([...spots, newSpot]);
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
