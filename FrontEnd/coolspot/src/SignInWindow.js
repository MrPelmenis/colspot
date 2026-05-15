import React, { useContext } from 'react';
import { WindowContext } from './WindowContext';

function SignInWindow() {
  const { windowStates } = useContext(WindowContext);
  const { updateWindowState } = useContext(WindowContext);

  const { visible } = windowStates.signInWindow;

  if (!visible) return null;

  const onClose = () => {
    updateWindowState('signInWindow', { email: "", visible: false });
    localStorage.setItem("JWT", "");
  };

  const handleSignInServer = (e) => {
    e.preventDefault();  // Prevent any default form submission
    console.log("Sign In button clicked");
    window.location.href = 'http://localhost:5000/api/login';
};


  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-100
                 w-2/3 md:w-1/2 lg:w-1/3"
      style={{ zIndex: 100 }}
    >
      <button type="button"
        className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
        style={{ width: '30px', height: '30px' }}
        onClick={handleSignInServer}
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSignInServer}  // Redirects to backend /login
          className="w-20 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

export default SignInWindow;
