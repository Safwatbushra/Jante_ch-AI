import React, { useState, useRef, useEffect } from 'react';
import '../styles/Pin.css';

const Pin = ({ pin, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pinRef = useRef(null);
  
  // Staggered animation delay based on index
  const animationDelay = `${0.05 * (index % 20)}s`;
  
  useEffect(() => {
    // Check if the pin is in the viewport to trigger animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pinRef.current.classList.add('visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (pinRef.current) {
      observer.observe(pinRef.current);
    }
    
    return () => {
      if (pinRef.current) {
        observer.unobserve(pinRef.current);
      }
    };
  }, []);
  
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      className={`pin ${isLoaded ? 'loaded' : ''}`}
      ref={pinRef}
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pin-image-container">
        {!isLoaded && <div className="pin-placeholder"></div>}
        <img 
          src={pin.imageUrl} 
          alt={pin.title} 
          onLoad={handleImageLoad}
          className={isLoaded ? 'loaded' : ''}
        />
        
        {isHovered && (
          <div className="pin-overlay">
            <div className="pin-actions">
              <button className="save-button">Save</button>
              <div className="icon-buttons">
                <button className="icon-button share">
                  <svg height="16" width="16" viewBox="0 0 24 24" aria-hidden="true" aria-label="" role="img">
                    <path d="M21 14c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2s2 .9 2 2v4h14v-4c0-1.1.9-2 2-2zM8.82 8.84c-.78.78-2.05.79-2.83 0-.78-.78-.79-2.04-.01-2.82L11.99 0l6.02 6.01c.78.78.79 2.05.01 2.83-.78.78-2.05.79-2.83 0l-1.2-1.19v6.18a2 2 0 1 1-4 0V7.66L8.82 8.84z"></path>
                  </svg>
                </button>
                <button className="icon-button more">
                  <svg height="16" width="16" viewBox="0 0 24 24" aria-hidden="true" aria-label="" role="img">
                    <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3M3 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm18 0c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <a href="#" className="pin-link"></a>
          </div>
        )}
      </div>
      
      <div className="pin-info">
        <h3 className="pin-title">{pin.title}</h3>
        <p className="pin-description">{pin.description}</p>
        <div className="pin-creator">
          <img src={pin.creatorImage} alt={pin.creator} className="creator-img" />
          <span>{pin.creator}</span>
        </div>
      </div>
    </div>
  );
};

export default Pin;