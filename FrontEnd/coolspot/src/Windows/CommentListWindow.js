import React, { useState, useContext, useEffect } from 'react';
import { CommentContext } from '../ContextProviders/CommentProvider';
import Comment from '../Comment';

function CommentListWindow() {
  const { visibleComments, setVisibleComments, fetchComment, commentInfo, setCommentInfo } = useContext(CommentContext);
  const [newComment, setNewComment] = useState('');

  // Fetch comments for the specific spot when the component is visible
  useEffect(() => {
    if (visibleComments && commentInfo?.spotID) {
      fetchComment(commentInfo.spotID);
    }
  }, [visibleComments, commentInfo?.spotID]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [
        ...commentInfo,
        { 
          id: Date.now(), // Create a unique ID for the new comment
          text: newComment, 
          createdAt: new Date().toLocaleString(), 
          author: 'Current User' // Replace with actual current user data
        },
      ];
      setCommentInfo(updatedComments);
      setNewComment('');
    }
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = commentInfo.filter(comment => comment.id !== commentId);
    setCommentInfo(updatedComments);
  };

  const handleEditComment = (commentId) => {
    const commentToEdit = commentInfo.find(comment => comment.id === commentId);
    if (commentToEdit) {
      setNewComment(commentToEdit.text);
      handleDeleteComment(commentId); // Delete the old comment before editing
    }
  };

  const handleLikeComment = (commentId) => {
    console.log(`Liked comment with ID: ${commentId}`);
    // Add like handling logic here if needed
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
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 
      transition-opacity duration-500 ${visibleComments ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClickOutside}
    >
      <div
        className={`relative bg-white p-6 rounded-lg shadow-lg z-100 
        w-11/12 sm:w-5/6 md:w-4/5 lg:w-1/2 xl:w-1/3 transform scale-95 opacity-0 transition-opacity duration-500 
        ${visibleComments ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
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
          className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors duration-300 mb-4"
          placeholder="Add your comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <button
          onClick={handleAddComment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors mb-4 w-full"
        >
          Add Comment
        </button>

        <div className="space-y-4 overflow-y-auto max-h-[200px]">
          {commentInfo && commentInfo.length > 0 ? (
            commentInfo.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onDelete={() => handleDeleteComment(comment.id)}
                onEdit={() => handleEditComment(comment.id)}
                onLike={() => handleLikeComment(comment.id)}
              />
            ))
          ) : (
            <p className="text-gray-600 text-center">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentListWindow;
