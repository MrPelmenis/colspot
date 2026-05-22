import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FaHeart, FaTrash, FaEdit } from 'react-icons/fa';
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { WindowContext } from './ContextProviders/WindowContext';

function Comment({ comment }) {
  const { currentUser } = useContext(CurrentUserContext);
  const { updateWindowState } = useContext(WindowContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(comment.likes);
  const [likedByUser, setLikedByUser] = useState(comment.liked_by.includes(currentUser.userID));

  useEffect(()=>{
    setLikedByUser(currentUser.userID && comment.liked_by.includes(currentUser.userID));
  }, [currentUser.userID]);

  const uniqueId = useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${comment.userName}-${comment.text}-${randomNumber}`;
  }, [comment.userName, comment.text]);

  const handleLikeClick = async (event) => {
    event.stopPropagation();

    try {
      if (likedByUser) {
        // If already liked, send a DELETE request to unlike the comment
        const response = await fetch(`/api/comments/${comment.id}/likes/${currentUser.userID}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setLikes(likes - 1);
          setLikedByUser(false);
        } else {
          console.error('Failed to unlike the comment');
        }
      } else {
        const response = await fetch(`/api/comments/${comment.id}/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    //console.log(comment);
    updateWindowState('deleteCommentWindow', { visible: true, commentID: comment.id });
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveClick = (event) => {
    event.stopPropagation();
    if (editText.trim().length < 3) {
      setError('Comment cannot be shorter than 3 characters');
      return;
    }
    alert("comment edit console logged info");
    console.log("id:", comment.id, "new text:", editText);
    setIsEditing(false);
    setError('');
  };

  const handleCancelClick = (event) => {
    event.stopPropagation();
    setIsEditing(false);
    setEditText(comment.text);
    setError('');
  };

  return (
    <div
      id={uniqueId}
      className="relative w-full bg-white rounded-md shadow-md p-4 mb-4 transition-all duration-500 ease-in-out hover:bg-gray-200 border-t border-gray-300"
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">{comment.userName}</p>
        <p className="text-sm text-gray-500">{ExtraFunctions.getTimeAgo(comment.time)}</p>
      </div>

      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              if (error) setError('');
            }}
            rows="3"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      ) : (
        <TextWithReadMoreButton text={comment.text} maxLength={50} onReadMoreClick={() => {}} />
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
              title={!currentUser.userID ? "You must be logged in to like" : "Like"}
            >
              <FaHeart className={likedByUser ? 'text-red-600' : 'text-gray-600'} />
              <span className="text-sm">{likes}</span>
            </button>
          </div>
        )}

        {comment.userName === currentUser.nickname && (
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
