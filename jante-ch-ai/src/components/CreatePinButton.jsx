// src/components/CreatePinButton.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/createPinButton.module.css';

const CreatePinButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={styles.createPinButtonContainer}>
      {isExpanded && (
        <div className={styles.createOptions}>
          <Link href="/pin-builder" className={styles.createOption}>
            <i className="fa-solid fa-thumbtack"></i>
            <span>Create Pin</span>
          </Link>
          <Link href="/pin-builder/collection" className={styles.createOption}>
            <i className="fa-solid fa-folder-plus"></i>
            <span>Create Collection</span>
          </Link>
        </div>
      )}
      
      <button 
        className={`${styles.createPinButton} ${isExpanded ? styles.expanded : ''}`}
        onClick={toggleExpand}
        aria-label="Create"
      >
        <i className={`fa-solid ${isExpanded ? 'fa-xmark' : 'fa-plus'}`}></i>
      </button>
    </div>
  );
};

export default CreatePinButton;