import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MasonryGrid from './components/MasonryGrid';
import Loader from './components/Loader';
import { pins as initialPins } from './data/pins';
import './App.css';

function App() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading pins from an API
    setLoading(true);
    setTimeout(() => {
      setPins(initialPins);
      setLoading(false);
    }, 1500);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setPins(initialPins);
      return;
    }
    
    const filteredPins = initialPins.filter(pin => 
      pin.title.toLowerCase().includes(query.toLowerCase()) ||
      pin.description.toLowerCase().includes(query.toLowerCase())
    );
    setPins(filteredPins);
  };

  return (
    <div className="app">
      <Header onSearch={handleSearch} />
      <main className="main-content">
        {loading ? (
          <Loader />
        ) : (
          <MasonryGrid pins={pins} />
        )}
      </main>
    </div>
  );
}

export default App;