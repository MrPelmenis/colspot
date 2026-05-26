import React, { useState, useEffect, useRef } from 'react';

function Footer() {
  const [showTOS, setShowTOS] = useState(false);
  const TOSRef = useRef(null);

  const toggleTOS = () => {
    setShowTOS((prev) => !prev);
  };

  const closeTOS = () => {
    setShowTOS(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (TOSRef.current && !TOSRef.current.contains(event.target)) {
        closeTOS();
      }
    };

    if (showTOS) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTOS]);

  return (
    <div className="relative bg-gray-200 py-4 w-full rounded-t-lg shadow-inner flex items-center justify-between px-4">
      <p className="text-gray-600 text-sm hidden sm:block">
        CoolSpot
      </p>
      {/* Middle Section */}
      <p className="text-gray-600 text-sm text-center">© 2025 CoolSpot. All rights reserved.</p>
      
      {/* Right Section */}
      <button 
        onMouseDown={(e) => e.stopPropagation()} // Stop mousedown propagation here
        onClick={toggleTOS} 
        className="text-black hover:underline text-sm">
        {showTOS ? 'Hide Terms Of Service' : 'Show Terms Of Service'}
      </button>

      {showTOS && (
        <div 
          ref={TOSRef}
          className="absolute z-50 mt-4 text-gray-700 border p-4 rounded-lg bg-white shadow-lg"
          style={{ maxHeight: '200px', overflowY: 'auto', width: '300px', bottom: '60px', right: '10px' }}
        >
          <button
            className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
            onClick={closeTOS}
          >
            &times;
          </button>
          <h3 className="text-lg font-bold mb-2">Terms of Service</h3>
          {window.websiteSetting.TOS}
          <button onClick={closeTOS} className="mt-2 text-black hover:underline">Close</button>
        </div>
      )}
    </div>
  );
}

export default Footer;
