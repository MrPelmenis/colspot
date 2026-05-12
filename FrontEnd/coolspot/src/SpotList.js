import React from 'react';

function SpotList({ spots }) {
  return (
    <div className="w-[60vw] bg-red-500 rounded-lg shadow-md mx-auto p-4">
      {spots.map((spot, index) => (
        <div key={index} className="w-full h-[100px] bg-white rounded-md shadow-md mb-4 flex items-center justify-center">
          <p>Lat: {spot.lat}, Lng: {spot.lng}</p>
        </div>
      ))}
    </div>
  );
}

export default SpotList;
