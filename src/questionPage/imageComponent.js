import React from 'react';

const ImageComponent = ({ imageUrl }) => {
  const imageStyle = {
    width: '900px', // or any desired width
    height: 'auto', // maintain aspect ratio
  };

  return (
    <img src={imageUrl} alt="Resized Image" style={imageStyle} />
  );
};

export default ImageComponent;
