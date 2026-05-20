import React, { useState, useContext, useEffect } from 'react';
import { WindowContext } from './WindowContext';
import { CurrentUserContext } from './CurrentUserContext';

import { SpotsContext } from './SpotsContext';

function AddSpotWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { visible } = windowStates.addSpotWindow;
  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

  const { spots, setSpots } = useContext(SpotsContext);

  const addSpotWindow = windowStates.addSpotWindow;

  useEffect(() => {
    if (visible) {
      setSpotName('');
      setDescription('');
      setImages([]);
      setErrorMessage('');
    }
  }, [visible]);

  const onClose = () => {
    updateWindowState('addSpotWindow', { visible: false });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handlePublishSpot = async () => {
    if (spotName.length < 3) {
      setErrorMessage('Spot name must be at least 3 characters long.');
      return;
    } else if (spotName.length > 30) {
      setErrorMessage('Spot name must not exceed 30 characters.');
      return;
    }
    if (!description || images.length === 0) {
      setErrorMessage('Please provide a description and upload at least one image.');
      return;
    }
  
    try {
      const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };
    
      const base64Images = await Promise.all(
        images.map((image) => convertToBase64(image))
      );
    
      const jsonData = {
        spotName,
        Description: description,
        images: base64Images,
        userName: currentUser.nickname,
        userEmail: currentUser.email,
        Geolocation: addSpotWindow.geoLocation,
      };
    
      const response = await fetch('http://localhost:5000/api/spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
    
      if (!response.ok) {
        throw new Error('Error publishing spot');
      }
    

      const newSpot = {
        Name: jsonData.spotName,
        Description: jsonData.Description,
        Geolocation: jsonData.Geolocation,
        Images: jsonData.images,
        userName: jsonData.userName,
        userEmail: jsonData.userEmail,
        Time: new Date().toISOString(), 
        likes: 0, 
      };
    
      updateWindowState('addSpotWindow', { visible: false });
      setSpots((prevSpots) => [newSpot, ...prevSpots,]);
      
    } catch (error) {
      console.error('Error uploading spot:', error);
      setErrorMessage('An error occurred while publishing your spot.');
    }



  };
  

  // Close window on click outside
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
          style={{ width: '30px', height: '30px' }}
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Add New Spot</h2>

        <input
          type="text"
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-1"
          placeholder="Spot Name"
          value={spotName}
          onChange={(e) => { setSpotName(e.target.value); setErrorMessage(''); }}
        />

        <textarea
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-4"
          placeholder="Spot Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ resize: 'none', height: '100px', overflowY: 'auto' }}
        />

        <div className="overflow-x-auto overflow-y-hidden mb-4 flex items-center space-x-4">
          <div className="flex flex-nowrap gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative flex-shrink-0 border border-gray-300 rounded-lg" style={{ height: '100px' }}>
                <img src={URL.createObjectURL(image)} alt={`Uploaded ${index}`} className="object-cover" style={{ height: '100px', width: 'auto' }} />

                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center"
                  style={{ width: '20px', height: '20px' }}
                >
                  &times;
                </button>
              </div>
            ))}

            <div
              className="relative border-2 border-blue-500 rounded-lg text-center cursor-pointer flex-none hover:bg-blue-100 transition-colors"
              style={{ width: '100px', height: '100px' }}
            >
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="image-upload"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span className="text-blue-500 text-xs">Add Images</span>
              </label>
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-red-500 mt-1 text-sm">{errorMessage}</p>}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="mr-4 bg-gray-300 text-black px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublishSpot}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Publish Spot
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddSpotWindow;
