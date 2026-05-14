import React from 'react';

function SpotList({ spots }) {
  return (
    <div className="w-[60vw] bg-red-500 rounded-lg shadow-md mx-auto p-4">
      {spots.map((spot, index) => (
        <div key={index} className="w-full h-[100px] bg-white rounded-md shadow-md mb-4 flex flex-col justify-center p-2">
          <p><strong>Description:</strong> {spot.Description}</p>
          <p><strong>Coordinates:</strong> Lat: {spot.Geolocation}</p>
        </div>
      ))}
    </div>
  );
}

export default SpotList;

// import React from 'react';

// function SpotList({ spots }) {
//   return (
//     <div className="w-[60vw] bg-red-500 rounded-lg shadow-md mx-auto p-4">
//       {spots.length === 0 ? (
//         <p>No spots available.</p>
//       ) : (
//         spots.map((spot) => (
//           <div key={spot.Id} className="w-full h-[100px] bg-white rounded-md shadow-md mb-4 flex flex-col justify-center p-2">
//             <p><strong>Name:</strong> {spot.Name}</p>
//             <p><strong>Description:</strong> {spot.Description}</p>
//             <p><strong>Coordinates:</strong> {spot.Geolocation}</p>
//             <p><strong>Karma:</strong> {spot.Karma}</p>
//             <p><strong>Time:</strong> {new Date(spot.Time).toLocaleString()}</p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// export default SpotList;
