import React, { useContext } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';

function AboutWindow() {
    const { windowStates, updateWindowState } = useContext(WindowContext);
    const { visible } = windowStates.aboutWindow || {};

    const handleClose = () => {
        updateWindowState('aboutWindow', { visible: false });
    };

    return (
        <div
            id="modal-overlay"
            className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center z-50 p-4 sm:p-6
                transition-opacity duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={(e) => e.target.id === 'modal-overlay' && handleClose()}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg 
                w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold 
                        flex items-center justify-center hover:bg-red-500 transition-all"
                    style={{ right: -1, top: -1 }}
                    onClick={handleClose}
                >
                    &times;
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">About Us</h2>

                {/* Content */}
                <div className="prose max-h-[60vh] overflow-y-auto">
                    {window.websiteSetting?.about && (
                        <div dangerouslySetInnerHTML={{ __html: window.websiteSetting.about }} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default AboutWindow;