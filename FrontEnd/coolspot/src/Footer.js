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

      {showTOS && ( // Conditionally render TOS text
        <div className="absolute z-50 mt-4 text-gray-700 border p-4 rounded-lg bg-white shadow-lg"
             style={{ maxHeight: '200px', overflowY: 'auto', width: '300px', bottom: '60px', right: '10px' }}>
          <h3 className="text-lg font-bold mb-2">Terms of Service</h3>
          <p>
            Upon initiation of your account, you hereby enter into an irrevocable and perpetual agreement with us, valid for the entirety of your natural lifespan (and potentially beyond). All data transmitted to our servers will be retained indefinitely, in accordance with our stringent data conservation protocols. The concept of "profile deletion" is scientifically obsolete within our framework; the only available recourse is the modification or partial rectification of your existing data.
          </p>
          <p>
            By creating an account, you are effectively consenting to a lifelong contract—terminable only by your biological cessation. However, even post-mortem, your profile will persist in our secure database, ensuring the continued preservation of your digital footprint for an indefinite temporal span. We appreciate your cooperation in this eternal endeavor.
          </p>
          <button onClick={closeTOS} className="mt-2 text-black hover:underline">Close</button>
        </div>
      )}
    </div>
  );
}

export default Footer;
