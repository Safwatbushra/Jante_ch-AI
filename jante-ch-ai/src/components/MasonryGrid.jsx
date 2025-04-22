'use client';

import { useEffect, useState } from 'react';
import Pin from './Pin';
import styles from '../styles/masonryGrid.module.css';

const MasonryGrid = ({ pins }) => {
  const [columns, setColumns] = useState(5);
  
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
  
  // Distribute pins into columns
  const columnPins = Array.from({ length: columns }, () => []);
  
  pins.forEach((pin, index) => {
    const columnIndex = index % columns;
    columnPins[columnIndex].push(pin);
  });
  
  return (
    <div className={styles.masonryGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {columnPins.map((column, columnIndex) => (
        <div key={columnIndex} className={styles.masonryColumn}>
          {column.map((pin, pinIndex) => (
            <Pin 
              key={pin.id} 
              pin={pin} 
              index={pinIndex + columnIndex} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;