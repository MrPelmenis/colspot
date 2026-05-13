import React, { useContext } from 'react';
import { WindowContext } from './WindowContext';

function SignInWindow() {
  const { windowStates } = useContext(WindowContext);

  // Check if the signInWindow is visible
  const { email, visible } = windowStates.signInWindow;

  if (!visible) return null; // Do not render if not visible

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg z-100"
      style={{ zIndex: 100 }}
    >
      <h2 className="text-xl font-bold">SignInWindow</h2>
      <p>Email: {email}</p>
    </div>
  );
}

export default SignInWindow;
