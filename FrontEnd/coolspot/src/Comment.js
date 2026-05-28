import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FaHeart, FaTrash, FaEdit } from 'react-icons/fa';
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { WindowContext } from './ContextProviders/WindowContext';
import { CommentContext } from './ContextProviders/CommentProvider';
import ProfileImage from './ProfileImage';
import heic2any from 'heic2any';

function Comment({ comment }) {
  const { currentUser } = useContext(CurrentUserContext);
  const { updateWindowState } = useContext(WindowContext);
  const { fetchComment, commentSpotID } = useContext(CommentContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(comment.likes);
  const [likedByUser, setLikedByUser] = useState(comment.liked_by.includes(currentUser.userID));
  const [newImage, setNewImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
  const TARGET_HEIGHT = 400;

  useEffect(() => {
    setLikedByUser(currentUser.userID && comment.liked_by.includes(currentUser.userID));
  }, [currentUser.userID]);

  useEffect(() => {
    setLikes(comment.likes);
    setLikedByUser(currentUser.userID && comment.liked_by.includes(currentUser.userID));
  }, [comment.id]);

  const processImage = async (file) => {
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

    const img = await createImageBitmap(file);
    if (file.size <= MAX_FILE_SIZE && img.height <= TARGET_HEIGHT) {
      img.close();
      return file;
    }

    const scaleFactor = TARGET_HEIGHT / img.height;
    const width = img.width * scaleFactor;
    img.close();

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
    if (e.target.files[0]) {
      try {
        const processedFile = await processImage(e.target.files[0]);
        setNewImage(processedFile);
        // When adding new image, mark original for removal if it exists
        if (comment.image) setRemoveImage(true);
      } catch (error) {
        console.error('Image processing error:', error);
        setError('Error processing image. Please try again.');
      }
    }
  };

  const handleRemoveNewImage = () => {
    setNewImage(null);
    // If original image existed, keep it removed when new image is removed
    if (comment.image) setRemoveImage(true);
  };

  const handleRemoveOriginalImage = () => {
    setRemoveImage(true);
    // If adding new image while removing original, clear new image
    if (newImage) setNewImage(null);
  };

  const handleLikeClick = async (event) => {
    event.stopPropagation();
    const jwtToken = localStorage.getItem('JWT');

    try {
      if (likedByUser) {
        const response = await fetch(`${window.websiteSetting.serverURL}/api/comments/${comment.id}/likes/${currentUser.userID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });

        if (response.ok) {
          setLikes(likes - 1);
          setLikedByUser(false);
        } else {
          console.error('Failed to unlike the comment');
        }
      } else {
        const response = await fetch(`${window.websiteSetting.serverURL}/api/comments/${comment.id}/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ user_id: currentUser.userID }),
        });

        if (response.ok) {
          setLikes(likes + 1);
          setLikedByUser(true);
        } else {
          console.error('Failed to like the comment');
        }
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    updateWindowState('deleteCommentWindow', { visible: true, commentID: comment.id });
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setEditText(comment.text);
    setNewImage(null);
    setRemoveImage(false);
    setIsEditing(true);
  };

  const handleSaveClick = async (event) => {
    event.stopPropagation();

    // Validate either text or image must be present
    if (editText.trim() === '' && !newImage && (removeImage || !comment.image)) {
      setError('Comment must contain either text or an image');
      return;
    }

    const jwtToken = localStorage.getItem('JWT');

    try {
      let imageBase64 = null;
      
      // Case 1: New image uploaded
      if (newImage) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(newImage);
        });
      } 
      // Case 2: Keeping original image (no changes)
      else if (comment.image && !removeImage) {
        // Fetch the original image as base64
        const response = await fetch(comment.image);
        const blob = await response.blob();
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      // Case 3: Removing image (imageBase64 remains null)
  
      const data = {
        comment: editText.trim(),
        image: imageBase64 // Always send the image data (null if removed)
      };
  
      console.log(data);

      const response = await fetch(`${window.websiteSetting.serverURL}/api/spots/${comment.id}/comment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsEditing(false);
        setError('');
        setNewImage(null);
        setRemoveImage(false);
        fetchComment(commentSpotID);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleCancelClick = (event) => {
    event.stopPropagation();
    setIsEditing(false);
    setEditText(comment.text);
    setNewImage(null);
    setRemoveImage(false);
    setError('');
  };

  const handleImageClick = (src) => {
    updateWindowState('viewImageWindow', { visible: true, imageSRC: src });
  };

  const handleProfileClick = (nickname) => {
    if (nickname === currentUser.nickname) {
      updateWindowState('profileWindow', { visible: true });
    } else if (nickname !== "deleted") {
      updateWindowState('viewProfileWindow', { visible: true, nickname });
    }
  };

  const uniqueId = useMemo(() => `${comment.id}-${Date.now()}`, [comment.id]);

  return (
    <div
      id={uniqueId}
      className="relative w-full bg-white rounded-md shadow-md p-4 mb-4 transition-all duration-500 ease-in-out border-2 border-gray-300"
    >
      <div className="flex justify-between items-center mb-2">
        <div className='flex items-center hover:underline' onClick={() => handleProfileClick(comment.userName)}>
          <ProfileImage nickname={comment.userName} inSpot={true} w={8} h={8} />
          <p className="text-sm ml-2 sm:text-base text-gray-500">{comment.userName}</p>
        </div>
        <p className="text-sm text-gray-500">{ExtraFunctions.getTimeAgo(comment.time)}</p>
      </div>

      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 border-b-2 border-gray-300 bg-white focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-1 resize-none"
            placeholder="Edit your comment (Max length 250)"
            value={editText}
            maxLength={250}
            onChange={(e) => {
              setEditText(e.target.value);
              setError('');
            }}
            rows="2"
          />

          <div className="my-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* Existing image - only show if not removed and no new image */}
              {comment.image && !removeImage && !newImage && (
                <div className="relative flex-shrink-0">
                  <img
                    src={comment.image}
                    alt="Current"
                    className="h-24 w-24 object-cover rounded-lg border-black border-2"
                  />
                  <button
                    onClick={handleRemoveOriginalImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center"
                    style={{ width: '20px', height: '20px' }}
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* New image preview */}
              {newImage && (
                <div className="relative flex-shrink-0">
                  <img
                    src={URL.createObjectURL(newImage)}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border-black border-2"
                  />
                  <button
                    onClick={handleRemoveNewImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center"
                    style={{ width: '20px', height: '20px' }}
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Add image button */}
              {(removeImage || !comment.image) && !newImage && (
                <div
                  className="relative border-2 border-blue-500 rounded-lg text-center cursor-pointer flex-none hover:bg-blue-100 transition-colors"
                  style={{ width: '40px', height: '40px' }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    title="Update image"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id={`edit-image-${comment.id}`}
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor={`edit-image-${comment.id}`}
                    className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
                  >
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </label>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      ) : (
        <>
          <TextWithReadMoreButton text={comment.text} maxLength={50} />
          {comment.image && !removeImage && (
            <img
              src={comment.image}
              onClick={() => handleImageClick(comment.image)}
              alt="Content"
              className="h-[200px] object-contain rounded-md mt-1 transition-transform duration-500 ease-in-out"
            />
          )}
        </>
      )}



      <div className="flex justify-between items-center mt-2 space-x-2">
        {!isEditing && (
          <div className="flex items-center">
            <button
              onClick={handleLikeClick}
              disabled={!currentUser.userID}
              className={`flex items-center justify-center w-12 gap-1 h-8 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300 ${
                likedByUser ? 'text-red-600' : 'text-gray-600'
              }`}
              title={!currentUser.userID ? "Log in to like" : "Like"}
            >
              <FaHeart className={likedByUser ? 'text-red-600' : 'text-gray-600'} />
              <span className="text-sm">{likes}</span>
            </button>
          </div>
        )}

        {((comment.userName === currentUser.nickname) || currentUser.is_admin) && (
          <div className="flex items-center ml-auto space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="flex items-center justify-center w-8 h-8 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
                  title="Edit"
                >
                  <FaEdit className="text-gray-600 hover:text-green-600" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center justify-center w-8 h-8 bg-transparent border border-gray-300 rounded-full hover:bg-red-200 transition duration-300"
                  title="Delete"
                >
                  <FaTrash className="text-gray-600 hover:text-red-600" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;