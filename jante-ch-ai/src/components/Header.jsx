// src/components/Header.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/header.module.css';

const Header = ({ onSearch, isMobileView }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };
  
  const handleSearchFocus = () => {
    if (isMobileView) {
      document.body.classList.add('search-focused');
    }
  };
  
  const handleSearchBlur = () => {
    if (isMobileView) {
      document.body.classList.remove('search-focused');
    }
  };
  
  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerContainer}>
        {isMobileView && (
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <i className={`fa-solid ${showMobileMenu ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        )}
        
        {isMobileView && (
          <div className={styles.mobileLogo}>
            <Link href="/">
              <svg className={styles.pinterestIcon} height="24" width="24" viewBox="0 0 24 24" aria-hidden="true" aria-label="" role="img">
                <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.9 2.161-2.9 1.02 0 1.512.765 1.512 1.682 0 1.025-.653 2.557-.99 3.978-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 0 1 .083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12"></path>
              </svg>
            </Link>
          </div>
        )}
        
        {!isMobileView && (
          <nav className={styles.navLinks}>
            <Link href="/" className={`${styles.navLink} ${styles.active}`}>
              Home
            </Link>
            <Link href="/explore" className={styles.navLink}>
              Explore
            </Link>
            <Link href="/create" className={styles.navLink}>
              Create
            </Link>
          </nav>
        )}
        
        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>
            <i className="fa-solid fa-search"></i>
          </div>
          <input 
            ref={searchInputRef}
            type="text" 
            className={styles.searchInput} 
            placeholder="Search for ideas" 
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchValue && (
            <button className={styles.clearSearch} onClick={clearSearch}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
        
        <div className={styles.userActions}>
          <button className={`${styles.iconButton} ${styles.notifications}`}>
            <i className="fa-solid fa-bell"></i>
          </button>
          
          <button className={`${styles.iconButton} ${styles.messages}`}>
            <i className="fa-solid fa-comment-dots"></i>
          </button>
          
          <div className={styles.userAvatar}>
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User avatar" />
          </div>
        </div>
      </div>
      
      {isMobileView && showMobileMenu && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <Link href="/" className={`${styles.mobileNavLink} ${styles.active}`}>
              <i className="fa-solid fa-house"></i>
              <span>Home</span>
            </Link>
            <Link href="/explore" className={styles.mobileNavLink}>
              <i className="fa-solid fa-compass"></i>
              <span>Explore</span>
            </Link>
            <Link href="/create" className={styles.mobileNavLink}>
              <i className="fa-solid fa-plus"></i>
              <span>Create</span>
            </Link>
            <Link href="/messages" className={styles.mobileNavLink}>
              <i className="fa-solid fa-comment-dots"></i>
              <span>Messages</span>
            </Link>
            <Link href="/profile" className={styles.mobileNavLink}>
              <i className="fa-solid fa-user"></i>
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;