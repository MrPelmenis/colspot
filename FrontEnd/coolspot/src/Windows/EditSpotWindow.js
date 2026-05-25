import React, { useState, useContext, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';
import { SpotsContext } from '../ContextProviders/SpotsContext';
import CategorySelector from '../CategorySelector';

function EditSpotWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { spots, setSpots, fetchSpots } = useContext(SpotsContext);
  const { visible, spotToEdit } = windowStates.editSpotWindow || {};
  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useContext(CurrentUserContext);

  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (visible && spotToEdit) {
      //console.log("spot to edit:", spotToEdit.categories);
      setSpotName(spotToEdit.Name);
      setDescription(spotToEdit.Description);
      setImages(spotToEdit.Images || []);
      setSelectedCategories(spotToEdit.categories || []);  // Load existing categories
      setErrorMessage('');
    }
  }, [visible, spotToEdit]);

  const onClose = () => {
    updateWindowState('editSpotWindow', { visible: false });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml',
      'image/heic',
      'image/heif',
      'image/tiff'
    ];
    

    // Check the maximum limit of images
    if (images.length + files.length > 3) {
      setErrorMessage('You can only upload a maximum of 3 images.');
      return;
    }
  
    // Validate file types
    for (const file of files) {
      if (!validImageTypes.includes(file.type)) {
        setErrorMessage(
          'Invalid file type. You can only upload images'
        );
        return;
      }
    }
  
    // Update images if all validations pass
    setImages((prevImages) => [...prevImages, ...files]);
  };

  
  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleUpdateSpot = async () => {
    if (spotName.length < 3 || spotName.length > 60) {
      setErrorMessage('Spot name must be between 3 and 60 characters.');
      return;
    }
    if (description.length > 250) {
      setErrorMessage('Description must not exceed 250 characters.');
      return;
    }
    if (!description || images.length === 0) {
      setErrorMessage('Please provide a description and upload at least one image.');
      return;
    }

    // Check if at least one category is selected
    if (selectedCategories.length === 0) {
      setErrorMessage('Please select at least one category.');
      return;
    }

    try {
      const convertToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

      const base64Images = await Promise.all(
        images.map((image) => (image instanceof File ? convertToBase64(image) : image))
      );

      // Update the geolocation (split the coordinates string into an object)
      let geoLoc = spotToEdit.Geolocation.split(",");
      let geoCoordJSON = { lat: geoLoc[0], lng: geoLoc[1] };

      // Prepare the edited spot object
      const updatedSpotData = {
        spotName,
        Description: description,
        images: base64Images,
        Geolocation: geoCoordJSON,
        userEmail: spotToEdit.userEmail, // Assuming userEmail is part of spotToEdit
        categories: selectedCategories,  // Add selected categories here
      };

      // Alert and console log the categories and the updated spot data
      //alert(`Categories updated: ${selectedCategories.join(', ')}`);
      //console.log('Updated Spot Data:', updatedSpotData);

      const jwtToken = localStorage.getItem('JWT');

      // Send the data to the server
      const response = await fetch(`${window.websiteSetting.serverURL}/api/spots/${spotToEdit.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(updatedSpotData),
      });

      if (!response.ok) {
        throw new Error('Error updating spot');
      }

      const result = await response.json();
      console.log(result.message);
      updateWindowState('viewSpotWindow', { visible: false });
      fetchSpots();  // Re-fetch the updated spots list
      onClose();     // Close the modal
      
    } catch (error) {
      console.error('Error updating spot:', error);
      setErrorMessage('An error occurred while updating the spot.');
    }
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
          style={{ width: '30px', height: '30px' }}
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Spot</h2>

        <input
          type="text"
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-1"
          placeholder="Spot Name (Max length 60)"
          value={spotName}
          onChange={(e) => {
            if(e.target.value.length < 60){
              setSpotName(e.target.value);
              setErrorMessage('');
            }
          }}
        />

        <textarea
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-4"
          placeholder="Spot Description (Max length 250)"
          value={description}
          onChange={(e) =>{ 
            if (e.target.value.length <= 250) {
              setDescription(e.target.value);
              setErrorMessage('');
            }
          }}
          style={{ resize: 'none', height: '100px', overflowY: 'auto' }}
        />

        <CategorySelector 
          visible={windowStates.editSpotWindow.visible}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />

        <div className="overflow-x-auto overflow-y-hidden mb-4 flex items-center space-x-4">
          <div className="flex flex-nowrap gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative flex-shrink-0 border border-gray-300 rounded-lg" style={{ height: '100px' }}>
                <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt={`Uploaded ${index}`} className="object-cover" style={{ height: '100px', width: 'auto' }} />

                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center"
                  style={{ width: '20px', height: '20px' }}
                >
                  &times;
                </button>
              </div>
            ))}
            {images.length < 3 && (
                <div
                className="relative border-2 border-blue-500 rounded-lg text-center cursor-pointer flex-none hover:bg-blue-100 transition-colors"
                style={{ width: '100px', height: '100px' }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="image-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span className="text-blue-500">Upload</span>
                </label>
              </div>
            )}
            
          </div>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="mr-4 bg-gray-300 text-black px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateSpot}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Update Spot
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSpotWindow;
