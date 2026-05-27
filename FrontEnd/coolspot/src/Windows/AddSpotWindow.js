import React, { useState, useContext, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';
import { SpotsContext } from '../ContextProviders/SpotsContext';
import CategorySelector from '../CategorySelector';
import heic2any from 'heic2any';

function AddSpotWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { visible } = windowStates.addSpotWindow;
  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useContext(CurrentUserContext);
  const { setSpotsUpdated, fetchSpots } = useContext(SpotsContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
  const TARGET_HEIGHT = 600;

  useEffect(() => {
    if (visible) {
      setSpotName('');
      setDescription('');
      setImages([]);
      setErrorMessage('');
      setSelectedCategories([]);
      setIsSubmitting(false);
    }
  }, [visible]);

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

  const handlePublishSpot = async () => {
    if (isSubmitting) return;

    // Validation checks
    if (spotName.length < 3 || spotName.length > 30) {
      setErrorMessage('Spot name must be between 3-30 characters');
      return;
    }
    if (!description || description.length > 250) {
      setErrorMessage('Description is required (max 250 characters)');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please upload at least one image');
      return;
    }
    if (selectedCategories.length === 0) {
      setErrorMessage('Please select at least one category');
      return;
    }

    try {
      setIsSubmitting(true);
      const jwtToken = localStorage.getItem('JWT');
      
      // Convert images to base64
      const base64Images = await Promise.all(images.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }));

      // Prepare payload
      const payload = {
        spotName,
        Description: description,
        user_id: currentUser.userID,
        images: base64Images,
        userName: currentUser.nickname,
        userEmail: currentUser.email,
        Geolocation: windowStates.addSpotWindow.geoLocation,
        categories: selectedCategories,
      };

      // Submit data
      const response = await fetch(`${window.websiteSetting.serverURL}/api/spots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Reset on success
      updateWindowState('addSpotWindow', { visible: false });
      setSpotsUpdated(true);
      fetchSpots();
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage('Failed to publish spot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      updateWindowState('addSpotWindow', { visible: false });
    }
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 
        transition-opacity duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClickOutside}
    >
      <div
        className={`relative bg-white p-6 rounded-lg shadow-lg z-100 
        w-11/12 sm:w-5/6 md:w-4/5 lg:w-1/2 xl:w-1/3 transform transition-transform duration-500 
        ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <button
          className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
          style={{ width: '30px', height: '30px' }}
          onClick={() => updateWindowState('addSpotWindow', { visible: false })}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Add New Spot</h2>

        <input
          type="text"
          className="w-full p-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 mb-0"
          placeholder="Spot Name"
          value={spotName}
          onChange={(e) => setSpotName(e.target.value.slice(0, 30))}
        />

        <textarea
          className="w-full p-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 mb-4"
          placeholder="Spot Description (max 250 characters)"
          value={description}
          style={{ resize: 'none', height: '100px', overflowY: 'auto' }}
          
          onChange={(e) => setDescription(e.target.value.slice(0, 250))}
          rows="4"
        />

        <CategorySelector
          visible={visible}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />

        <div className="my-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(image)}
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
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="image-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span className="text-blue-500 text-xs select-none">Add Images</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={() => updateWindowState('addSpotWindow', { visible: false })}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            onClick={handlePublishSpot}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Spot'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddSpotWindow;