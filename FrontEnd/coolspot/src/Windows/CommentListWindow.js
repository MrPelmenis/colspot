import React, { useState, useContext, useEffect } from 'react';
import { CommentContext } from '../ContextProviders/CommentProvider';
import Comment from '../Comment';

import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';

function CommentListWindow() {
  const { visibleComments, setVisibleComments, fetchComment, commentInfo, setCommentInfo, commentSpotID, setCommentSpotID } = useContext(CommentContext);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(''); // State to hold validation error

  const { currentUser } = useContext(CurrentUserContext);

  useEffect(() => {
    if (visibleComments && commentInfo.length > 0 && commentSpotID) {
     // fetchComment(commentInfo[0].spotID);
    }
  }, [visibleComments]);
  

  const handleAddComment = async () => {
    if (newComment.trim().length < 3) {
      setError('Comment cannot be shorter than 3 characters');
      return;
    }

    try {
      const response = await fetch(`../api/spots/${commentSpotID}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: currentUser.nickname,
          userEmail: currentUser.email,
          comment: newComment,
        }),
      });

      if (response.ok) {
        setNewComment(''); // Clear the input after adding
        setError(''); // Clear any previous errors
        fetchComment(commentSpotID); // Refresh comments
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onClose = () => {
    setVisibleComments(false);
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
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

        <input
          type="text"
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-1"
          placeholder="Add your comment"
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (error) setError(''); // Clear error when user starts typing
          }}
        />

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>} {/* Display error if it exists */}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Comment
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[200px] mt-4">
          {commentInfo && commentInfo.length > 0 ? (
            commentInfo.map((comment, index) => (
              <Comment
                key={`${comment.userName}-${index}`} // Ensure that each comment has a unique identifier
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
