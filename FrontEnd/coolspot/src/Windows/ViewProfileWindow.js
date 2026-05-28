import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import defaultProfilePic from '../images/DefaultProfilePic.png';
import { FaComment } from 'react-icons/fa';

function ViewProfileWindow() {
    const { windowStates, updateWindowState } = useContext(WindowContext);
    const { visible, nickname } = windowStates.viewProfileWindow || {};
    
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!visible || !nickname) return;
            
            setLoading(true);
            try {
                const response = await fetch(
                    `${window.websiteSetting.serverURL}/api/check_user_by_nickname`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ nickname: nickname }),
                    }
                );
                
                const data = await response.json();
                
                if (response.status === 200) {
                    setUserData({
                        profilePic: data.user.profile_pic || defaultProfilePic,
                        username: data.user.nickname,
                        description: data.user.description,
                        isAdmin: data.user.is_admin,
                    });
                    setError("");
                } else if (response.status === 201) {
                    setError("User with such nickname doesn't exist");
                    setUserData(null);
                } else {
                    throw new Error('Unexpected response');
                }
            } catch (err) {
                setError("Failed to load user profile");
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [visible, nickname]);

    const handleClose = () => {
        updateWindowState('viewProfileWindow', { visible: false, nickname: "" });
    };

    const handleMessage = () => {
        alert(`Coming soon!`);
    };

    const handleImageClick = (src) =>{
        updateWindowState('viewImageWindow', { visible: true, imageSRC: src });
    } 

    return (
        <div
            id="modal-overlay"
            className={`fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-40 
                transition-opacity transition-visibility duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={(e) => e.target.id === 'modal-overlay' && handleClose()}
        >
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3">
                <button
                    className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
                    onClick={handleClose}
                >
                    &times;
                </button>

                {loading && <p className="text-center">Loading...</p>}

                {userData && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={userData.profilePic}
                                alt="Profile"
                                className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover"
                                onClick={() => handleImageClick(userData.profilePic)}
                            />
                            <div>
                                <h2 className={`text-2xl font-bold ${userData.isAdmin ? 'text-red-800' : 'text-gray-800'}`}>
                                    {userData.username}
                                </h2>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-gray-800">
                                {userData.description || "No description provided"}
                            </p>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                            <button
                                onClick={handleMessage}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                            >
                                <FaComment className="mr-2" />
                                Message
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewProfileWindow;