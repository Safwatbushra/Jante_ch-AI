'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import MasonryGrid from '../components/MasonryGrid';
import Loader from '../components/Loader';
import { pins as initialPins } from '../data/pins';

export default function Home() {
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

    return ( <
        div >
        <
        Header onSearch = { handleSearch }
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
        /div>
    );
}