import React, { useContext } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import { FaTrophy, FaEnvelope, FaPhone, FaInfoCircle, FaFileContract } from 'react-icons/fa';
import { transformation } from 'leaflet';

function MenuWindow() {
    const { windowStates, updateWindowState } = useContext(WindowContext);
    const { visible } = windowStates.menuWindow || {};

    const handleMenuClick = (windowName) => {
        const windowStates = {
            leaderboardWindow: { visible: true },
            messagesWindow: { visible: true },
            contactWindow: { visible: true },
            aboutWindow: { visible: true },
            deleteCommentWindow: { visible: false, commentID: null },
            /*viewSpotWindow: { visible: false },
            viewImageWindow: { visible: false, imageSRC: null },
            viewProfileWindow: { visible: false, nickname: "" },
            menuWindow: { visible: false },*/ 
            termsOfServiceWindow: { visible: true },
        };

        updateWindowState(windowName, windowStates[windowName]);
    };

    const closeMenu = () => {
        updateWindowState('menuWindow', { visible: false });
    };

    return (
    <div
    id="modal-overlay"
    className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center z-20 p-4 sm:p-6
    transition-opacity duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
    onClick={(e) => e.target.id === 'modal-overlay' && closeMenu()} // Close when clicking outside
    >
        <div className="bg-white p-6 rounded-lg shadow-lg 
            w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
                className="absolute top-2 right-2 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold 
                    flex items-center justify-center hover:bg-red-500 transition-all"
                    style={{right:-1, top:-1}}
                onClick={closeMenu}
            >
                &times;
            </button>
    
            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">Menu</h2>
    
            {/* Menu Items */}
            <div className="space-y-4 w-full flex flex-col items-center">
                {/* Active Button */}
                <button
                    onClick={() => handleMenuClick('leaderboardWindow')}
                    className="flex items-center justify-center gap-4 p-3 w-full text-left 
                        border-b-2 border-gray-300 hover:border-gray-400 
                        transition-all duration-300 group"
                >
                    <FaTrophy className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-lg font-semibold text-gray-800">Leaderboard</span>
                </button>


                <button
                    onClick={() => handleMenuClick('aboutWindow')}
                    className="flex items-center justify-center gap-4 p-3 w-full text-left 
                        border-b-2 border-gray-300 hover:border-gray-400 
                        transition-all duration-300 group"
                >
                    <FaInfoCircle className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-lg font-semibold text-gray-800">About</span>
                </button>

                <button
                    onClick={() => handleMenuClick('termsOfServiceWindow')}
                    className="flex items-center justify-center gap-4 p-3 w-full text-left 
                        border-b-2 border-gray-300 hover:border-gray-400 
                        transition-all duration-300 group"
                >
                    <FaFileContract className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-lg font-semibold text-gray-800">Terms of Service</span>
                </button>


                {[
                    { name: 'Messages', icon: <FaEnvelope /> },
                    { name: 'Contact', icon: <FaPhone /> },
                ].map(({ name, icon }) => (
                    <button
                        key={name}
                        disabled
                        className="flex items-center justify-center gap-4 p-2 w-full text-left 
                            border-b-2  border-gray-300 
                            transition-all duration-300 cursor-not-allowed
                            opacity-50"
                    >
                        {React.cloneElement(icon, { className: 'text-gray-500' })}
                        <span className="text-lg font-semibold text-gray-500">{name}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
    );
}

export default MenuWindow;
