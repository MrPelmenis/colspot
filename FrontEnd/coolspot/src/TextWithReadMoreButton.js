import './App.css';
import { useState } from 'react';

export default function TextWithReadMoreButton(props) {
  const maxTextLength = props.maxLength;
  const [maxLength, setLength] = useState(maxTextLength);

  const textShortener = (inputText, maxLength) => {
    if (inputText) {
      if (maxLength === -1) {
        return inputText;
      } else {
        return inputText.length < maxLength
          ? inputText
          : inputText.substring(0, maxLength) + "...";
      }
    } else {
      return "";
    }
  };

  const changeLength = (event) => {
    event.stopPropagation();
    if (maxLength === -1) {
      setLength(maxTextLength);
    } else {
      setLength(-1);
      
      props.onReadMoreClick(); 
    }
  };

  const buttonChecker = () => {
    if (props.text.length > maxTextLength) {
      return (
        <button
          className="readMoreOrLess text-blue-500 hover:underline ml-1" // Small margin for spacing
          onClick={changeLength}
        >
          {maxLength === -1 ? "Read Less" : "Read More"}
        </button>
      );
    }
  };

  return (
    <div className="text-gray-700 text-sm mt-2 overflow-hidden">
      <p className="break-words overflow-wrap inline">
        {textShortener(props.text, maxLength)}
      </p>
      {buttonChecker()}
    </div>
  );
}
