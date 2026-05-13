import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from "@react-oauth/google";

function Header() {
  const handleLoginSuccess = (response) => {
    console.log("JWT Token:", response.credential);  // JWT token from Google
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
    <header className="bg-gray-200 py-4 w-full flex justify-between items-center px-4 rounded-b-lg shadow-md sticky top-0 z-10">
      <h1 className="text-4xl font-bold text-gray-800 flex-grow text-center md:text-left">CoolSpot</h1>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => alert('Login Failed')}
      />
    </header>
    </GoogleOAuthProvider>
  );
}

export default Header;
