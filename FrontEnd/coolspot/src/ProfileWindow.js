import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';
import { FaPencilAlt } from 'react-icons/fa'; // Import a pencil icon from react-icons
import defaultProfilePic from './images/DefaultProfilePic.png'; 

function ProfileWindow() {
  const { windowStates } = useContext(WindowContext);
  const { updateWindowState } = useContext(WindowContext);
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

  const { visible } = windowStates.profileWindow;

  const [profilePicSrc, setProfilePicSrc] = useState(defaultProfilePic); // State for profile picture
  const [description, setDescription] = useState(currentUser.description || ""); // State for description input
  const [isEditingUsername, setIsEditingUsername] = useState(false); // State to toggle edit mode for username
  const [newUsername, setNewUsername] = useState(currentUser.username); // State for new username

  // Ensure that newUsername is updated if currentUser.username changes
  useEffect(() => {
    setNewUsername(currentUser.username);
  }, [currentUser.username]);

  // Update the description state when currentUser changes
  useEffect(() => {
    setDescription(currentUser.description || ""); // Set initial description from currentUser
  }, [currentUser.description]);

  if (!visible) return null;

  const onClose = () => {
    updateWindowState('profileWindow', { email: "", visible: false });
  };

  const onNameChange = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameSave = () => {
    if (newUsername.trim() !== "" && newUsername !== currentUser.username) {
      updateCurrentUser({ ...currentUser, username: newUsername }); // Update context with new username
    }
    setIsEditingUsername(false);
  };

  const uploadImg = (event) => {
    let file = event.target.files[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas dimensions to resize the image
          const width = 500;
          const height = 500;

          canvas.width = width;
          canvas.height = height;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const resizedDataUrl = canvas.toDataURL('image/jpeg'); 
          console.log(resizedDataUrl);
          setProfilePicSrc(resizedDataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    console.log(JSON.stringify({ nickname: newUsername, description, email: currentUser.email }));
    
    const res = await fetch('/api/update_user_profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname: newUsername, description, email: currentUser.email }),
    });

    if (!res.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await res.json();
    console.log("Profile updated response:", data);

    // Update the current user context with new values
    updateCurrentUser({ ...currentUser, username: newUsername, description });
  };

  const onLogOut = () => {
    localStorage.setItem("JWT", "");
    updateWindowState('profileWindow', { email: "", visible: false });
  };

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-100
                 w-2/3 md:w-1/2 lg:w-1/3"
      style={{ zIndex: 100 }}
    >
      <button
        className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
        onClick={onClose}
      >
        &times;
      </button>
  
      <div className="flex justify-start items-center mb-4 mt-1">
        <div className="relative mr-3">
          <img
            src={profilePicSrc}
            alt="Profile"
            className="w-12 h-12 border border-black rounded-full object-cover mr-3"
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

        <div className="flex items-center">
          {isEditingUsername ? (
            <input
              type="text"
              className="text-2xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onBlur={handleUsernameSave} // Save when input loses focus
              autoFocus
            />
          ) : (
            <h2 
              className="text-2xl font-bold inline-flex items-center cursor-pointer"
            >
              {currentUser.username}
              <FaPencilAlt className="ml-2 text-gray-500 hover:text-gray-700" onClick={onNameChange} />
            </h2>
          )}
        </div>
      </div>
  
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
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
  
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={onLogOut}
          className="text-gray-500 hover:underline transition-colors"
        >
          Log Out
        </button>
        <button
          onClick={updateProfile} 
          className="w-30 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default ProfileWindow;
