import React, { useEffect, useContext } from 'react';
import Spot from './Spot';
import { SpotsContext } from './SpotsContext';

function SpotList() {
  const { spots, setSpots } = useContext(SpotsContext); // Access spots and setSpots from context

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/spots');
        const data = await response.json();
        console.log("no servera spoti:", data);
        setSpots(data); // Set the spots in the context
      } catch (error) {
        console.error('Error fetching spots:', error);
      }
    };

    fetchSpots();
  }, [setSpots]);

  return (
    <div className="w-[100vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] mx-auto p-6">
      {spots.length === 0 ? (
        <p>Be the first to upload a spot....</p>
      ) : (
        spots.map((spot) => (
          <Spot key={spot.Id} spot={spot} />
        ))
      )}
    </div>
  );
}

export default SpotList;
