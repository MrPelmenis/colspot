import React, { useState, useEffect } from 'react';

function SpotList() {
  const [spots, setSpots] = useState([]);

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

  return (
    <div className="w-[60vw] bg-red-500 rounded-lg shadow-md mx-auto p-4">
      {spots.length === 0 ? (
        <p>No spots available.</p>
      ) : (
        spots.map((spot, index) => (
          <div key={index} className="w-full h-[100px] bg-white rounded-md shadow-md mb-4 flex flex-col justify-center p-2">
            <p><strong>Description:</strong> {spot.Description}</p>
            <p><strong>Coordinates:</strong> Lat: {spot.Geolocation}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default SpotList;
