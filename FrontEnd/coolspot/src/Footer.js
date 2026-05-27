import React, { useState, useEffect, useRef } from 'react';

function Footer() {
  const [showTOS, setShowTOS] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const TOSRef = useRef(null);
  const aboutRef = useRef(null);

  const toggleTOS = () => setShowTOS((prev) => !prev);
  const closeTOS = () => setShowTOS(false);
  const toggleAbout = () => setShowAbout((prev) => !prev);
  const closeAbout = () => setShowAbout(false);

  // Handle click outside for TOS
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (TOSRef.current && !TOSRef.current.contains(event.target)) {
        closeTOS();
      }
    };

    showTOS 
      ? document.addEventListener('mousedown', handleClickOutside)
      : document.removeEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTOS]);

  // Handle click outside for About
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        closeAbout();
      }
    };

    showAbout 
      ? document.addEventListener('mousedown', handleClickOutside)
      : document.removeEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAbout]);

  return (
    <div className="relative bg-gray-200 py-4 w-full rounded-t-lg shadow-inner flex items-center justify-between px-4">
      {/* Left Section - About */}
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={toggleAbout}
        className="text-black hover:underline text-sm"
      >
        {showAbout ? 'About' : 'About'}
      </button>

      {/* Middle Section */}
      <p className="text-gray-600 text-sm text-center">© 2025 CoolSpot</p>
      
      {/* Right Section - TOS */}
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={toggleTOS} 
        className="text-black hover:underline text-sm"
      >
        {showTOS ? 'Hide Terms Of Service' : 'Show Terms Of Service'}
      </button>

      {/* About Modal */}
      {showAbout && (
        <div 
          ref={aboutRef}
          className="absolute z-50 mt-4 text-gray-700 border p-4 rounded-lg bg-white shadow-lg"
          style={{ maxHeight: '200px', overflowY: 'auto', width: '300px', bottom: '60px', left: '10px' }}
        >
          <button
            className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
            onClick={closeAbout}
          >
            &times;
          </button>
          <h3 className="text-lg font-bold mb-2">About</h3>
          {window.websiteSetting.about} <br/>
          <button onClick={closeAbout} className="mt-2 text-black hover:underline">Close</button>
        </div>
      )}

      {/* TOS Modal */}
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