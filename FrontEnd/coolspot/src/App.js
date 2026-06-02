import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MapDiv from './MapComponents/Map.js';
import SpotList from './SpotList';
import { WindowProvider } from './ContextProviders/WindowContext.js';
import { CurrentUserProvider } from './ContextProviders/CurrentUserContext.js';
import SignInWindow from './Windows/SignInWindow';
import ProfileWindow from './Windows/ProfileWindow.js';
import DeleteProfileWindow from './Windows/DeleteProfileWindow.js';
import AddSpotWindow from './Windows/AddSpotWindow.js';
import { SpotsProvider } from './ContextProviders/SpotsContext.js';
import DeleteSpotWindow from './Windows/DeleteSpotWindow.js';
import EditSpotWindow from './Windows/EditSpotWindow.js';
import { CommentProvider } from './ContextProviders/CommentProvider.js';
import CommentListWindow from './Windows/CommentListWindow.js';
import DeleteCommentWindow from "./Windows/DeleteCommentWindow.js";
import ViewSpotWindow from './Windows/ViewSpotWindow.js';
import MapProvider from './ContextProviders/MapContext.js';
import ViewImageWindow from './Windows/ViewImageWindow.js';
import SpotSelectionProvider from './ContextProviders/SpotSelectionProvider.js';
import ViewProfileWindow from './Windows/ViewProfileWindow.js';
import LeaderboardWindow from './Windows/LeaderboardWindow.js';
import MenuWindow from './Windows/MenuWindow.js';
import AboutWindow from './Windows/AboutWindow.js';
import TermsOfServiceWindow from './Windows/TermsOfServiceWindow.js';


function App() {
  return (
    <CurrentUserProvider>
      <WindowProvider>
      <SpotSelectionProvider>
        <SpotsProvider> 
          <CommentProvider>
            <MapProvider>
                <div className="flex flex-col items-center bg-gray-800 min-h-screen">
                  <SignInWindow />
                  <ProfileWindow />
                  <DeleteProfileWindow />
                  <AddSpotWindow />
                  <DeleteSpotWindow />
                  <EditSpotWindow />
                  <CommentListWindow />
                  <DeleteCommentWindow />
                  <ViewSpotWindow />
                  <ViewImageWindow />
                  <ViewProfileWindow/>
                  <LeaderboardWindow/>
                  <AboutWindow/>
                  <TermsOfServiceWindow/>
                  <MenuWindow/>


                  <Header />
                  <div className="flex flex-col gap-8 my-8">
                    <MapDiv />
                    <SpotList />
                  </div>
                  <Footer />
                </div>
              
            </MapProvider>
          </CommentProvider>
        </SpotsProvider>
        </SpotSelectionProvider>
      </WindowProvider>
    </CurrentUserProvider>
  );
}

export default App;
