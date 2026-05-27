import React, { useState, useContext, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';
import { SpotsContext } from '../ContextProviders/SpotsContext';
import CategorySelector from '../CategorySelector';
import heic2any from 'heic2any';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
  const TARGET_HEIGHT = 600;

  useEffect(() => {
    if (visible && spotToEdit) {
      setSpotName(spotToEdit.Name);
      setDescription(spotToEdit.Description);
      setImages(spotToEdit.Images || []);
      setSelectedCategories(spotToEdit.categories || []);
      setErrorMessage('');
    }
  }, [visible, spotToEdit]);

  const processImage = async (file) => {
    // Convert HEIC/HEIF to JPEG
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
      file = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      }).then(convertedBlob => new File([convertedBlob], `${file.name.split('.')[0]}.jpg`, {
        type: 'image/jpeg',
        lastModified: new Date().getTime()
      }));
    }

    // Skip processing if under size limit and correct dimensions
    const img = await createImageBitmap(file);
    if (file.size <= MAX_FILE_SIZE && img.height <= TARGET_HEIGHT) {
      img.close();
      return file;
    }

    // Calculate new dimensions
    const scaleFactor = TARGET_HEIGHT / img.height;
    const width = img.width * scaleFactor;
    img.close();

    // Resize using canvas
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = TARGET_HEIGHT;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, TARGET_HEIGHT);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: new Date().getTime()
            }));
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      if (images.length + files.length > 3) {
        setErrorMessage('Maximum of 3 images allowed');
        return;
      }

      setIsSubmitting(true);
      const processedFiles = await Promise.all(files.map(processImage));
      setImages(prev => [...prev, ...processedFiles]);
      setErrorMessage('');
    } catch (error) {
      console.error('Image processing error:', error);
      setErrorMessage('Error processing images. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSpot = async () => {
    if (isSubmitting) return;

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
    if (selectedCategories.length === 0) {
      setErrorMessage('Please select at least one category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const convertToBase64 = (file) => {
        if (typeof file === 'string') return file; // Keep existing base64 strings
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      };

      const base64Images = await Promise.all(images.map(convertToBase64));

      let geoLoc = spotToEdit.Geolocation.split(",");
      let geoCoordJSON = { lat: geoLoc[0], lng: geoLoc[1] };

      const updatedSpotData = {
        spotName,
        Description: description,
        images: base64Images,
        Geolocation: geoCoordJSON,
        userEmail: spotToEdit.userEmail,
        categories: selectedCategories,
      };

      const jwtToken = localStorage.getItem('JWT');

      const response = await fetch(`${window.websiteSetting.serverURL}/api/spots/${spotToEdit.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(updatedSpotData),
      });

      if (!response.ok) throw new Error('Error updating spot');

      const result = await response.json();
      console.log(result.message);
      updateWindowState('viewSpotWindow', { visible: false });
      fetchSpots();
      onClose();
    } catch (error) {
      console.error('Error updating spot:', error);
      setErrorMessage('An error occurred while updating the spot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const onClose = () => {
    updateWindowState('editSpotWindow', { visible: false });
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  // Keep your existing JSX structure below - only added isSubmitting checks
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
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                  alt={`Preview ${index}`}
                  className="h-24 w-24 object-cover rounded-lg border-black border-2"
                />
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
                  disabled={isSubmitting}
                  capture="environment"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span className="text-blue-500 select-none">Add Images</span>
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
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateSpot}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Spot'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSpotWindow;