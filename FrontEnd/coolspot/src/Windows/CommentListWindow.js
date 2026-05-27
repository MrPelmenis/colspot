import React, { useState, useContext, useEffect } from 'react';
import { CommentContext } from '../ContextProviders/CommentProvider';
import Comment from '../Comment';

import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';

function CommentListWindow() {
  const { visibleComments, setVisibleComments, fetchComment, commentInfo, setCommentInfo, commentSpotID, setCommentSpotID } = useContext(CommentContext);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(''); // State to hold validation error

  const [sortOption, setSortOption] = useState('recent'); // State to track selected sorting option

  const { currentUser } = useContext(CurrentUserContext);

  // Sort comments function
  const sortComments = (comments, option) => {
    switch (option) {
      case 'mostLiked':
        return [...comments].sort((a, b) => b.likes - a.likes); // Sort by likes
      case 'recent':
        return [...comments].sort((a, b) => new Date(b.time) - new Date(a.time)); // Sort by time
      default:
        return comments;
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim().length < 3) {
      setError('Comment must be between 3 and 250 characters');
      return;
    }

    const jwtToken = localStorage.getItem('JWT');

    try {
      const response = await fetch(`${window.websiteSetting.serverURL}/api/spots/${commentSpotID}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userName: currentUser.nickname,
          userEmail: currentUser.email,
          comment: newComment
        }),
      });

      if (response.ok) {
        setNewComment(''); // Clear the input after adding
        setError(''); // Clear any previous errors
        //setCommentInfo([]);
        await fetchComment(commentSpotID); // Refresh comments
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);

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

        <textarea
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-1 resize-none"
          placeholder="Add your comment (Max length 250)"
          value={newComment}
          maxLength={250}
          onChange={(e) => {
            setNewComment(e.target.value);
            setError('');
          }}
          rows="2" // Sets the number of rows in the textarea
        />

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
            disabled={!currentUser.nickname}
            className={`${
              !currentUser.nickname ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white text-sm px-3 py-1 rounded-lg shadow transition-colors`}
          >
            {!currentUser.nickname ? 'Log in to comment' : 'Comment'}
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[200px] mt-4">
          {commentInfo && commentInfo.length > 0 ? (
            // Apply sorting directly in JSX
            sortComments(commentInfo, sortOption).map((comment, index) => (
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
