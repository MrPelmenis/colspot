import React, { useState, useContext, useEffect } from 'react';
import { WindowContext } from './WindowContext';

function AddSpotWindow() {
  const { windowStates, updateWindowState } = useContext(WindowContext);
  const { visible } = windowStates.addSpotWindow;

  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset input when the window becomes visible
  useEffect(() => {
    if (visible) {
      setSpotName('');
      setDescription('');
      setImages([]);
      setErrorMessage('');
    }
  }, [visible]);

  if (!visible) return null;

  const onClose = () => {
    updateWindowState('addSpotWindow', { visible: false });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handlePublishSpot = async () => {
    // Validate spotName length
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

    const formData = new FormData();
    formData.append('spotName', spotName);
    formData.append('description', description);
    images.forEach((image, index) => formData.append(`images[${index}]`, image));

    alert("upload spot");
    try {
      const response = await fetch('http://localhost:5000/api/spots', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error publishing spot');
      }

      // Close the window upon successful submission
      updateWindowState('addSpotWindow', { visible: false });
    } catch (error) {
      console.error('Error uploading spot:', error);
      setErrorMessage('An error occurred while publishing your spot.');
    }
  };

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-100
                 w-2/3 md:w-1/2 lg:w-1/3"
      style={{ zIndex: 100 }}
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
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition-colors duration-300 mb-1" // Reduced bottom margin
        placeholder="Spot Name"
        value={spotName}
        onChange={(e) => {
        setSpotName(e.target.value);
        setErrorMessage(''); // Clear error message on change
        }}
    />



      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent transition-colors duration-300 mb-4"
        placeholder="Spot Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        multiple
        onChange={handleImageChange}
        className="mb-4"
      />

      {images.length > 0 && (
        <div className="mb-4">
          <p>Uploaded Images:</p>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={URL.createObjectURL(image)}
                alt={`Uploaded ${index}`}
                className="w-full h-auto object-cover"
              />
            ))}
          </div>
        </div>
      )}

        {errorMessage && (
            <p className="text-red-500 mt-1 text-sm">{errorMessage}</p> // Set margin top to 1
        )}

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
  );
}

export default AddSpotWindow;
