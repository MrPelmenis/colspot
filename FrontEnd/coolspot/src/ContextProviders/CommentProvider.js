import React, { createContext, useState } from 'react';

export const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const [visibleComments, setVisibleComments] = useState(false); 
  const [commentInfo, setCommentInfo] = useState(null);

  const fetchComment = async (spotID) => {
    /*try {
      const response = await fetch(`http://localhost:5000/api/comments/${spotID}`);
      const data = await response.json();
      setCommentInfo(data); // Update commentInfo with fetched data
    } catch (error) {
      console.error('Error fetching comment:', error);
    }*/
      setCommentInfo({userName: "test", userEmail: "test", comment: "test", timestamp: "test"});
  };

  return (
    <CommentContext.Provider value={{ visibleComments, setVisibleComments, commentInfo, setCommentInfo, fetchComment }}>
      {children}
    </CommentContext.Provider>
  );
};
