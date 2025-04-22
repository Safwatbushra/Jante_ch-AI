// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MasonryGrid from '../components/MasonryGrid';
import Loader from '../components/Loader';
import CreatePinButton from '../components/CreatePinButton';
import { pins as initialPins } from '../data/pins';

export default function Home() {
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        // Check if mobile view
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        // Simulate loading pins from an API
        setLoading(true);
        setTimeout(() => {
            setPins(initialPins);
            setLoading(false);
        }, 1500);

        return () => window.removeEventListener('resize', checkMobileView);
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

    return ( <
        div className = "pinterest-app" > {!isMobileView && < Sidebar / > } <
        div className = "main-container" >
        <
        Header onSearch = { handleSearch }
        isMobileView = { isMobileView }
        /> <
        main className = "main-content" > {
            loading ? ( <
                Loader / >
            ) : ( <
                MasonryGrid pins = { pins }
                />
            )
        } <
        /main> <
        CreatePinButton / >
        <
        /div> <
        /div>
    );
}