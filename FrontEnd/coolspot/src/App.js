import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Map from './Map';
import SpotList from './SpotList';

function App() {
  return (
    <div className="flex flex-col items-center bg-gray-800 min-h-screen">
      <Header />
      
      {/* Middle Section with Map and SpotList */}
      <div className="flex flex-col gap-8 my-8">
        <Map />
        <SpotList />
      </div>

      <Footer />
    </div>
  );
}

export default App;
