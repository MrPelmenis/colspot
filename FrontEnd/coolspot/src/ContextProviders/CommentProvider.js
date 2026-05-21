import React, { createContext, useState } from 'react';

export const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const [visibleComments, setVisibleComments] = useState(false); 
  const [commentInfo, setCommentInfo] = useState([]);
  const [commentSpotID, setCommentSpotID] = useState(null);

  const fetchComment = async (spotID) => {
    try {
      const response = await fetch(`http://localhost:5000/api/spots/${spotID}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();

      const formattedComments = data.map(comment => ({
        id: comment.id,
        userName: comment.userName,
        userEmail: comment.userEmail,
        spotID: spotID,
        text: comment.comment, 
        time: comment.timestamp,
      }));

      setCommentInfo(formattedComments);
    } catch (error) {
      console.error('Error fetching comment:', error);
    }
  };
  

  return (
    <CommentContext.Provider value={{ visibleComments, setVisibleComments, commentInfo, setCommentInfo, fetchComment,  commentSpotID, setCommentSpotID }}>
      {children}
    </CommentContext.Provider>
  );
};
