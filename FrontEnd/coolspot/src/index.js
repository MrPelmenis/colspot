import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId='304862924981-o5ghsqptv2e8jjbkvli6cm0rov256ahv.apps.googleusercontent.com'>
    <React.StrictMode>
        <App />
    </React.StrictMode>
  </GoogleOAuthProvider>
);

