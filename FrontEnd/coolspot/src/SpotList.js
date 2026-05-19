import React, { useState, useEffect } from 'react';
import Spot from './Spot';

function SpotList() {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/spots');
        const data = await response.json();
        console.log(data);
        setSpots(data);
      } catch (error) {
        console.error('Error fetching spots:', error);
      }
    };

    fetchSpots();
  }, []);

  return (
    <div className="w-[60vw] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 border-white border-2 rounded-lg shadow-lg mx-auto p-6">
      {spots.length === 0 ? (
        <p>No spots available.</p>
      ) : (
        spots.map((spot) => (
          <Spot key={spot.Id} spot={spot} />
        ))
      )}
    </div>
  );
}

export default SpotList;
