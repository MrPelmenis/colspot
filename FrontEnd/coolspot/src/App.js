import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MapDiv from './Map';
import SpotList from './SpotList';
import { WindowProvider } from './WindowContext';
import { CurrentUserProvider } from './CurrentUserContext';
import SignInWindow from './SignInWindow';
import ProfileWindow from './ProfileWindow';

function App() {
  const [spots, setSpots] = useState([]);
  const [token, setToken] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); // To track if the user is logged in


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

  const addSpot = (newSpot) => {
    setSpots([...spots, newSpot]);
  };

  //  // Function to check for token in the URL
  //  const checkForTokenInUrl = () => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const tokenFromUrl = urlParams.get('token');

  //   if (tokenFromUrl) {
  //     // Save token to localStorage or sessionStorage
  //     localStorage.setItem('jwtToken', tokenFromUrl);
  //     setToken(tokenFromUrl);
  //     setIsAuthenticated(true);
  //     // Optionally, remove the token from the URL to clean it up
  //     window.history.replaceState({}, document.title, "/");
  //   } else {
  //     // If no token in URL, check localStorage
  //     const savedToken = localStorage.getItem('jwtToken');
  //     if (savedToken) {
  //       setToken(savedToken);
  //       setIsAuthenticated(true);
  //     }
  //   }
  // };

  // // First check for token in URL
  // checkForTokenInUrl();


  return (
    <CurrentUserProvider> {/* Wrap with CurrentUserProvider */}
      <WindowProvider>
        <div className="flex flex-col items-center bg-gray-800 min-h-screen">
          <SignInWindow />
          <ProfileWindow />
          <Header />
          <div className="flex flex-col gap-8 my-8">
            <MapDiv addSpot={addSpot} />
            <SpotList spots={spots} />
          </div>
          <Footer />
        </div>
      </WindowProvider>
    </CurrentUserProvider>
  );
}

export default App;
