// Comment.js
import React, { useState, useContext, useMemo } from 'react';
import { FaHeart, FaTrash, FaEdit } from 'react-icons/fa';
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';

function Comment({ comment, onDelete, onEdit, onLike }) {
  const { currentUser } = useContext(CurrentUserContext);
  const [liked, setLiked] = useState(false);

  const uniqueId = useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${comment.author}-${comment.text}-${randomNumber}`;
  }, [comment.author, comment.text]);

  const handleLikeClick = (event) => {
    event.stopPropagation();
    setLiked(!liked);
    if (onLike) onLike();
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    if (onDelete) onDelete(comment.id);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    if (onEdit) onEdit(comment.id);
  };

  return (
    <div
      id={uniqueId}
      className="relative w-full bg-white rounded-md shadow-md p-4 mb-4 transition-all duration-500 ease-in-out hover:bg-gray-200"
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">
          {comment.author} - {ExtraFunctions.getTimeAgo(comment.time)}
        </p>
      </div>

      <TextWithReadMoreButton
        text={comment.text}
        maxLength={50}
      />

      <div className="flex justify-end items-center mt-2 space-x-2">
        <button
          onClick={handleLikeClick}
          className="flex items-center justify-center w-8 h-8 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
          title="Like"
        >
          <FaHeart className={`text-gray-600 ${liked ? 'text-red-600' : 'hover:text-red-600'}`} />
        </button>

        {comment.author === currentUser.nickname && (
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
    </div>
  );
}

export default Comment;
