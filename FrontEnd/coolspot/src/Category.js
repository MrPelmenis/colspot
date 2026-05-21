import React from 'react';
import { FaRegSmile, FaUsers, FaExclamationTriangle, FaMountain, FaDollarSign, FaHistory, FaUtensils, FaGem, FaTree, FaCocktail, FaDog, FaChild, FaPaintBrush, FaHeart } from 'react-icons/fa';

const categoryStyles = {
  Chill: { color: 'lightblue', icon: <FaRegSmile /> },
  Socializing: { color: 'yellow', icon: <FaUsers /> },
  Dangerous: { color: 'red', icon: <FaExclamationTriangle /> },
  Scenic: { color: 'green', icon: <FaMountain /> },
  'Free/Pay': { color: 'gray', icon: <FaDollarSign /> },
  Historical: { color: 'brown', icon: <FaHistory /> },
  Foodie: { color: 'orange', icon: <FaUtensils /> },
  'Hidden Gem': { color: 'purple', icon: <FaGem /> },
  'Outdoor Activities': { color: 'teal', icon: <FaTree /> },
  Nightlife: { color: 'midnightblue', icon: <FaCocktail /> },
  'Pet-Friendly': { color: 'lightgreen', icon: <FaDog /> },
  'Family-Friendly': { color: 'lightyellow', icon: <FaChild /> },
  Artistic: { color: 'turquoise', icon: <FaPaintBrush /> },
  Romantic: { color: 'pink', icon: <FaHeart /> }
};

const Category = ({ name }) => {
  const { color, icon } = categoryStyles[name] || { color: 'lightgray', icon: null };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: color,
      color: 'white',
      padding: '5px 10px',
      borderRadius: '15px',
      width: '100px',
      height: '30px',
      fontWeight: 'bold',
      fontSize: '14px',
    }}>
      <span>{name}</span>
      <span style={{ marginLeft: '5px' }}>{icon}</span>
    </div>
  );
};

export default Category;
