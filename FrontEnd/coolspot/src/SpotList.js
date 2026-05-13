import React from 'react';

function SpotList({ spots }) {
  return (
    <div className="w-[60vw] bg-red-500 rounded-lg shadow-md mx-auto p-4">
      {spots.map((spot, index) => (
        <div key={index} className="w-full h-[100px] bg-white rounded-md shadow-md mb-4 flex flex-col justify-center p-2">
          <p><strong>Description:</strong> {spot.description}</p>
          <p><strong>Coordinates:</strong> Lat: {spot.lat}, Lng: {spot.lng}</p>
        </div>
      ))}
    </div>
  );
}

export default SpotList;
