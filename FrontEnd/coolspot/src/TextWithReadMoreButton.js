import React, { useState, useEffect } from 'react';
import './App.css';

export default function TextWithReadMoreButton({ text, maxLength, onReadMoreClick, spotClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (spotClose) {
      setIsExpanded(false);
    }
  }, [spotClose]);

  const handleToggle = (event) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
    if (!isExpanded && onReadMoreClick) {
      onReadMoreClick();
    }
  };

  const displayText = isExpanded || text.length <= maxLength
    ? text
    : `${text.substring(0, maxLength)}...`;

  return (
    <div className="text-gray-700 text-sm mt-2 overflow-hidden">
      <p className="break-words overflow-wrap inline">{displayText}</p>
      {text.length > maxLength && (
        <button
          className="readMoreOrLess text-blue-500 hover:underline ml-1"
          onClick={handleToggle}
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
