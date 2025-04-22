// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Pinterest Clone',
    description: 'A Pinterest clone built with Next.js App Router',
};

export default function RootLayout({ children }) {
    return ( <
        html lang = "en" >
        <
        head >
        <
        link rel = "stylesheet"
        href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" / >
        <
        /head> <
        body className = { inter.className } > { children } <
        /body> <
        /html>
    );
}