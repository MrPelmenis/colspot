import React, { useState } from 'react';

function Spot({ spot }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div 
      className={`w-full bg-white rounded-md shadow-md mb-4 p-4 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden ${expanded ? 'h-auto' : 'h-[100px]'}`} 
      onClick={toggleExpanded}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xl font-semibold">{spot.Name}</p>
          <p className="text-sm text-gray-500">By {spot.userName}</p>
        </div>
      </div>
      <p className="text-gray-700 text-sm mt-2">{spot.Description}</p>
      {expanded && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {spot.Images.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Spot ${spot.Name} - Image ${index + 1}`} 
              className="w-full h-[200px] object-contain rounded-md transition-all duration-500 ease-in-out opacity-0 transform scale-0"
              style={{ opacity: expanded ? 1 : 0, transform: expanded ? 'scale(1)' : 'scale(0)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Spot;
