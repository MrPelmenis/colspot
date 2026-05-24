import React from 'react';

const categories = [
  'Chill',
  'Socializing',
  'Dangerous',
  'Scenic',
  'Pay',
  'Historical',
  'Foodie',
  'Hidden Gem',
  'Outdoor Activities',
  'Nightlife',
  'Pet-Friendly',
  'Family-Friendly',
  'Artistic',
  'Romantic',
];

const Category = ({ name, isVisible }) => {
  return (
    <div
      className={`flex items-end justify-center border-b-2 border-black 
                  pb-[2px] px-[2px] text-sm font-bold text-black 
                  leading-none cursor-pointer 
                  transition-opacity duration-500 hover:text-gray-600
                  ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {name}
    </div>
  );
};

export default Category;
