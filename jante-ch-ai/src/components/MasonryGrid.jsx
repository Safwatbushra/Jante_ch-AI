// src/components/MasonryGrid.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Pin from './Pin';
import styles from '../styles/masonryGrid.module.css';

const MasonryGrid = ({ pins }) => {
  const [columns, setColumns] = useState(5);
  const gridRef = useRef(null);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width > 1600) setColumns(6);
      else if (width > 1200) setColumns(5);
      else if (width > 900) setColumns(4);
      else if (width > 600) setColumns(3);
      else if (width > 400) setColumns(2);
      else setColumns(1);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  // Distribute pins into columns optimally (by height)
  const distributeItems = () => {
    // Initialize column heights
    const columnHeights = Array(columns).fill(0);
    const columnPins = Array.from({ length: columns }, () => []);
    
    // Distribute pins to the shortest column
    pins.forEach(pin => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add pin to the shortest column
      columnPins[shortestColumnIndex].push(pin);
      
      // Update the column height (using a rough estimate based on image aspect ratio)
      // In a real app, you'd use actual image dimensions
      const aspectRatio = 1.5; // Default aspect ratio estimate
      columnHeights[shortestColumnIndex] += 100 + 300 / aspectRatio; // Base height + image height
    });
    
    return columnPins;
  };
  
  const columnPins = distributeItems();
  
  return (
    <div 
      className={styles.masonryGrid} 
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      ref={gridRef}
    >
      {columnPins.map((column, columnIndex) => (
        <div key={columnIndex} className={styles.masonryColumn}>
          {column.map((pin, pinIndex) => (
            <Pin 
              key={pin.id} 
              pin={pin} 
              index={pinIndex + columnIndex * 10} // Stagger animation
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;