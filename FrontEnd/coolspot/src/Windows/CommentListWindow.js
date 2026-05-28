import React, { useState, useContext } from 'react';
import { CommentContext } from '../ContextProviders/CommentProvider';
import Comment from '../Comment';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';
import heic2any from 'heic2any';

function CommentListWindow() {
  const { visibleComments, setVisibleComments, fetchComment, commentInfo, commentSpotID } = useContext(CommentContext);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useContext(CurrentUserContext);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
  const TARGET_HEIGHT = 400;

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
        setImage(processedFile);
      } catch (error) {
        console.error('Image processing error:', error);
        setError('Error processing image. Please try again.');
      }
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim().length < 3 && !image) {
      setError('Comment must be between 3 and 250 characters');
      return;
    }

    const jwtToken = localStorage.getItem('JWT');
    setIsSubmitting(true);

    try {
      let imageBase64 = '';
      if (image) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      const response = await fetch(`${window.websiteSetting.serverURL}/api/spots/${commentSpotID}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userName: currentUser.nickname,
          userEmail: currentUser.email,
          comment: newComment,
          image: imageBase64
        }),
      });

      if (response.ok) {
        setNewComment('');
        setImage(null);
        setError('');
        await fetchComment(commentSpotID);
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);
  const onClose = () => setVisibleComments(false);
  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') onClose();
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 flex items-center justify-center z-50 ${visibleComments ? 'visible' : 'invisible'}`}
      style={{
        backgroundColor: visibleComments ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        opacity: visibleComments ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out, background-color 0.3s ease-in-out'
      }}
      onClick={handleClickOutside}
    >
      <div
        className={`relative bg-white p-6 rounded-lg shadow-lg z-100 w-11/12 sm:w-5/6 md:w-4/5 lg:w-1/2 xl:w-1/3 transition-transform duration-300 ${visibleComments ? 'scale-100' : 'scale-95'}`}
      >
        <button
          className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-500"
          onClick={onClose}
          style={{ width: '30px', height: '30px' }}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Comments</h2>

        <textarea
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-1 resize-none"
          placeholder="Add your comment (Max length 250)"
          value={newComment}
          maxLength={250}
          onChange={(e) => {
            setNewComment(e.target.value);
            setError('');
          }}
          rows="2"
        />

        <div className="my-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {image && (
              <div className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-lg border-black border-2"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center"
                  style={{ width: '20px', height: '20px' }}
                >
                  &times;
                </button>
              </div>
            )}

            {!image && (
              <div
                className="relative border-2 border-gray-500 rounded-lg text-center cursor-pointer flex-none hover:bg-gray-100 transition-colors"
                style={{ width: '40px', height: '40px' }}
              >
                <input
                  type="file"
                  accept="image/*"
                  title="Comment Images Coming Soon!"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="image-upload"
                  onChange={handleImageChange}
                  onClick={(e) => {
                    e.preventDefault(); // Prevents the file dialog from opening
                    alert("Comment Images Coming Soon!");
                  }}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </label>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <div className="flex justify-between items-center mt-4">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="border p-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Recent Comments</option>
            <option value="mostLiked">Most Liked</option>
          </select>

          <button
            onClick={handleAddComment}
            disabled={!currentUser.nickname || isSubmitting}
            className={`${
              !currentUser.nickname ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white text-sm px-3 py-1 rounded-lg shadow transition-colors`}
          >
            {!currentUser.nickname ? 'Log in to comment' : isSubmitting ? 'Posting...' : 'Comment'}
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[200px] mt-4">
          {commentInfo && commentInfo.length > 0 ? (
            commentInfo.sort((a, b) => sortOption === 'mostLiked' ? b.likes - a.likes : new Date(b.time) - new Date(a.time)).map((comment, index) => (
              <Comment
                key={`${comment.userName}-${index}`}
                comment={comment}
              />
            ))
          ) : (
            <p className="text-gray-600 text-center">Be the first one to comment...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentListWindow;