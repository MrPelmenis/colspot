import React, { useContext, useMemo } from 'react';
import { FaHeart, FaTrash, FaEdit } from 'react-icons/fa';
import TextWithReadMoreButton from './TextWithReadMoreButton';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';
import { CommentContext } from './ContextProviders/CommentProvider';

function Comment({ comment }) {
  const { currentUser } = useContext(CurrentUserContext);
  const { setCommentInfo } = useContext(CommentContext);
  

  const uniqueId = useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${comment.userName}-${comment.text}-${randomNumber}`;
  }, [comment.userName, comment.text]);

  const handleLikeClick = (event) => {
    event.stopPropagation();
    alert("like comment");
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    alert("delete comment");
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    alert("edit");
  };

  const emptyFunction = () => {};

  return (
    <div
      id={uniqueId}
      className="relative w-full bg-white rounded-md shadow-md p-4 mb-4 transition-all duration-500 ease-in-out hover:bg-gray-200 border-t border-gray-300"
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">{comment.userName}</p>
        <p className="text-sm text-gray-500">{ExtraFunctions.getTimeAgo(comment.time)}</p>
      </div>

      <TextWithReadMoreButton
        text={comment.text}
        maxLength={50}
        onReadMoreClick={emptyFunction}
      />

      <div className="flex justify-between items-center mt-2 space-x-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleLikeClick}
            className="flex items-center justify-center w-8 h-8 bg-transparent border border-gray-300 rounded-full hover:bg-gray-200 transition duration-300"
            title="Like"
          >
            <FaHeart className="text-gray-600 hover:text-red-600" />
          </button>
          <span className="text-sm text-gray-600">7</span>
        </div>

        {comment.userName === currentUser.nickname && (
          <div className="flex space-x-2">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;
