// src/components/Pin.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/pin.module.css';

const Pin = ({ pin, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const pinRef = useRef(null);
  
  // Staggered animation delay based on index
  const animationDelay = `${0.05 * (index % 20)}s`;
  
  useEffect(() => {
    // Check if the pin is in the viewport to trigger animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pinRef.current.classList.add(styles.visible);
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
  
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };
  
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Share functionality would go here
  };
  
  const handleMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // More options functionality would go here
  };

  return (
    <div 
      className={`${styles.pin} ${isLoaded ? styles.loaded : ''}`}
      ref={pinRef}
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/pin/${pin.id}`} className={styles.pinLink}>
        <div className={styles.pinImageContainer}>
          {!isLoaded && <div className={styles.pinPlaceholder}></div>}
          <img 
            src={pin.imageUrl} 
            alt={pin.title} 
            onLoad={handleImageLoad}
            className={isLoaded ? styles.loaded : ''}
          />
          
          {isHovered && (
            <div className={styles.pinOverlay}>
              <div className={styles.pinActions}>
                <button 
                  className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                  onClick={handleSave}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <div className={styles.iconButtons}>
                  <button 
                    className={`${styles.iconButton} ${styles.share}`}
                    onClick={handleShare}
                    aria-label="Share"
                  >
                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                  </button>
                  <button 
                    className={`${styles.iconButton} ${styles.more}`}
                    onClick={handleMore}
                    aria-label="More options"
                  >
                    <i className="fa-solid fa-ellipsis"></i>
                  </button>
                </div>
              </div>
              <div className={styles.pinDestination}>
                <span>{pin.destination || 'pinterest.com'}</span>
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.pinInfo}>
          <h3 className={styles.pinTitle}>{pin.title}</h3>
          <p className={styles.pinDescription}>{pin.description}</p>
          <div className={styles.pinCreator}>
            <img src={pin.creatorImage} alt={pin.creator} className={styles.creatorImg} />
            <span>{pin.creator}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Pin;