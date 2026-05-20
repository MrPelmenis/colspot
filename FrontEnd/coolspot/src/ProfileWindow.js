import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';
import { FaPencilAlt, FaTrash } from 'react-icons/fa'; // Import the trash icon

import defaultProfilePic from './images/DefaultProfilePic.png';
import ProfileImage from './ProfileImage';

import { SpotsContext } from './SpotsContext';

function ProfileWindow() {
    const { windowStates, updateWindowState } = useContext(WindowContext);
    const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

    const { spots, setSpots, fetchSpots } = useContext(SpotsContext);

    const { visible } = windowStates.profileWindow;

    const [profilePicSrc, setProfilePicSrc] = useState(currentUser.profile_pic || defaultProfilePic);
    const [description, setDescription] = useState(currentUser?.description || "");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState(currentUser?.nickname || "");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaved, setIsSaved] = useState(false); 

    useEffect(() => {
        setDescription(currentUser?.description || "");
        setNewUsername(currentUser?.nickname || "");
        setProfilePicSrc(currentUser.profile_pic || defaultProfilePic);
    }, [currentUser]);

    const onClose = () => {
        setIsSaved(false);
        updateWindowState('profileWindow', { email: "", visible: false });
        updateWindowState('deleteProfile', { visible: false, nickname:"" });
    };

    const onNameChange = () => {
        setIsSaved(false);
        setIsEditingUsername(true);
    };

    const handleDecChange = (value) => {
        setDescription(value);
        setIsSaved(false);
    }

    const handleUsernameSave = () => {
        if (newUsername.trim().length < 3) {
            setErrorMessage("Username must be at least 3 characters long.");
            return;
        }

        setErrorMessage(""); 
        setIsEditingUsername(false);
    };

    const uploadImg = (event) => {
        let file = event.target.files[0];
        if (file) {
            let data = new FormData();
            data.append('file', file);
            
            const reader = new FileReader();
            reader.onload = async () => {
              const img = new Image();
              img.src = reader.result;
              img.onload = async() => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = 500;
                let height = 500;

                canvas.width = width;
                canvas.height = height;


                let xOffset = 0;
                let yOffset = 0;

                if (img.width <= img.height) {
                    width = Math.round((img.width / img.height) * height);
                    xOffset = (height - width)/2;
                } else {
                    height = Math.round((img.height / img.width) * width);
                    yOffset = (width - height)/2;
                }
                ctx.fillStyle = "white";
                ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.drawImage(img, xOffset, yOffset, width, height);
                const resizedDataUrl = canvas.toDataURL('image/jpeg');
            
                setProfilePicSrc(resizedDataUrl);
              };
            };
            reader.readAsDataURL(file);
        }
    }

    const updateProfile = async () => {
        if (newUsername.trim().length < 3) {
            setErrorMessage("Nickname must be at least 3 characters long.");
            return;
        }

        setErrorMessage(""); 

        const res = await fetch('/api/update_user_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname: newUsername, description, email: currentUser.email, profile_pic: profilePicSrc }),
        });

        if (!res.ok) {
            throw new Error('Failed to update profile');
        }

        const data = await res.json();
        //console.log("data from update:", data);
        if (data.message === 'took') {
            setErrorMessage("This nickname is already taken.");
            setIsSaved(false);
        } else {
            //console.log("Profile updated successfully!");
            updateCurrentUser({ ...currentUser, nickname: newUsername, description: description, profile_pic: profilePicSrc });
            fetchSpots();
            setIsSaved(true);
        }
    };

    const onLogOut = () => {
        localStorage.setItem("JWT", "");
        updateWindowState('profileWindow', { email: "", visible: false });
        updateCurrentUser({  nickname: "", email: "", description: "", profile_pic: "" });
    };

    const onDeleteProfile = () => {
        updateWindowState('deleteProfile', { visible: true, nickname:currentUser.nickname });
    };

    const handleClickOutside = (e) => {
        if (e.target.id === 'modal-overlay') {
          onClose();
        }
    };

    return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 
      transition-opacity transition-visibility duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClickOutside}
    >
      <div
        className={`relative bg-white p-6 rounded-lg shadow-lg z-100 
        w-11/12 sm:w-5/6 md:w-4/5 lg:w-1/2 xl:w-1/3 transform scale-95 opacity-0 transition-opacity duration-500 
        ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
            <button
                className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
                onClick={onClose}
            >
                &times;
            </button>

            <div className="flex flex-wrap items-center mt-1">
                <div className="relative mr-3 mb-3">
                    <img
                        src={profilePicSrc}
                        alt="Profile"
                        className="w-12 h-12 border border-black rounded-full object-cover justify-center align-center"
                    />
                    <input
                        onChange={uploadImg}
                        type="file"
                        id="imgInput"
                        accept="image/png, image/jpeg"
                        className="hidden"
                    />
                    <label htmlFor="imgInput">
                        <div className="absolute bottom-0 right-0 bg-gray-300 p-1 w-6 h-6 text-center rounded-full leading-5 cursor-pointer">
                            <FaPencilAlt className="text-gray-500 hover:text-gray-700" />
                        </div>
                    </label>
                </div>

                {/* Username input */}
                <div className="flex-1 min-w-0">
                    {isEditingUsername ? (
                        <div className="flex flex-col">
                            <input
                                type="text"
                                className="w-full text-2xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300"
                                value={newUsername}
                                onChange={(e) => {
                                    setNewUsername(e.target.value);
                                    if (e.target.value.trim().length < 3) {
                                        setErrorMessage("Nickname must be at least 3 characters long.");
                                    } else {
                                        setErrorMessage("");
                                    }
                                }}
                                onBlur={handleUsernameSave}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <h2
                            className="text-2xl font-bold inline-flex items-center cursor-pointer break-words"
                        >
                            {newUsername}
                            <FaPencilAlt className="ml-2 text-gray-500 hover:text-gray-700" onClick={onNameChange} />
                        </h2>
                    )}
                </div>
            </div>

            {errorMessage && (
                <span className="text-red-500 text-sm">{errorMessage}</span>
            )}

            <div className="mb-4 mt-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                    Description:
                </label>
                <input
                    type="text"
                    id="description"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter your bio"
                    value={description}
                    onChange={(e) => handleDecChange(e.target.value)}
                />
            </div>

            <div className="flex justify-between items-center mt-2">
                <span className='flex'>
                    <FaTrash
                        className="text-red-500 cursor-pointer hover:text-red-700 ml-2"
                        size={20}
                        description="Delete Profile"
                        onClick={onDeleteProfile}
                    />

                    
                    <button
                        onClick={onLogOut}
                        className="text-gray-500 hover:underline transition-colors ml-2"
                    >
                        Log Out
                    </button>
                </span>
                                
                <button
                    onClick={updateProfile}
                    className="w-30 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    {!isSaved ? "Save Changes" : "Changes Saved"}
                </button>
            </div>
        </div>
    </div>
    );
}

export default ProfileWindow;