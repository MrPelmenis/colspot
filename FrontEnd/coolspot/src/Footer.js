import React, { useState } from 'react';

function Footer() {
  const [showTOS, setShowTOS] = useState(false);

  const toggleTOS = () => {
    setShowTOS(!showTOS);
  };

  const closeTOS = () => {
    setShowTOS(false);
  };

  return (
    <div className="relative bg-gray-200 py-4 w-full rounded-t-lg shadow-inner flex items-center justify-between px-4">
      {/* Left Section */}
      <p className="text-gray-600 text-sm">
        CoolSpot
      </p>
      
      {/* Middle Section */}
      <p className="text-gray-600 text-sm text-center">© 2024 CoolSpot. All rights reserved.</p>
      
      {/* Right Section */}
      <button 
        onClick={toggleTOS} 
        className="text-black hover:underline text-sm">
        {showTOS ? 'Hide Terms Of Service' : 'Show Terms Of Service'}
      </button>

      {showTOS && (
        <div className="absolute z-50 mt-4 text-gray-700 border p-4 rounded-lg bg-white shadow-lg"
             style={{ maxHeight: '200px', overflowY: 'auto', width: '300px', bottom: '60px', right: '10px' }}>
          <h3 className="text-lg font-bold mb-2">Terms of Service</h3>
          {window.websiteSetting.TOS}
          <button onClick={closeTOS} className="mt-2 text-black hover:underline">Close</button>
        </div>
      )}
    </div>
  );
}

export default Footer;
