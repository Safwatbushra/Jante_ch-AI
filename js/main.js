/*
 * Jante ChAi - Main JavaScript
 * Animations, interactions, and functionality
 */

// Defensive measures to prevent third-party script conflicts
(() => {
  // Prevent potential errors from external scripts
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filter out specific MutationObserver errors from external scripts
    const errorMessage = args.join(' ');
    if (errorMessage.includes('MutationObserver') && errorMessage.includes('web-client-content-script')) {
      return; // Suppress this specific error
    }
    originalConsoleError.apply(console, args);
  };

  // Add error boundary for iframe and DOM interactions
  window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('MutationObserver') || 
        event.message.includes('web-client-content-script'))) {
      event.preventDefault();
      return false;
    }
  });

  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.toString().includes('MutationObserver')) {
      event.preventDefault();
    }
  });
})();

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }

  // Create particles for hero section with enhanced error handling
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles && typeof heroParticles.appendChild === 'function') {
    try {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('span');
        if (particle && particle.classList) {
          particle.classList.add('particle');
          
          // Random size
          const size = Math.random() * 10 + 5;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          
          // Random position
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.left = `${Math.random() * 100}%`;
          
          // Random animation duration and delay
          const duration = Math.random() * 20 + 10;
          const delay = Math.random() * 10;
          particle.style.animationDuration = `${duration}s`;
          particle.style.animationDelay = `${delay}s`;
          
          heroParticles.appendChild(particle);
        }
      }
    } catch (error) {
      console.warn('Could not create hero particles:', error);
    }
  }

  // Preloader
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      }, 1500);
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // Active nav link based on scroll position
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    window.addEventListener("scroll", () => {
      let current = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - sectionHeight / 3) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    });
  }

  // Back to top button
  const backToTopButton = document.getElementById("backToTop");
  if (backToTopButton) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add("active");
      } else {
        backToTopButton.classList.remove("active");
      }
    });

    backToTopButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Close mobile menu if open
        const navbarCollapse = document.querySelector(".navbar-collapse");
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
          const navbarToggler = document.querySelector(".navbar-toggler");
          if (navbarToggler) {
            navbarToggler.click();
          }
        }
      }
    });
  });
  // Initialize translation system if available
  if (typeof i18n !== 'undefined') {
    i18n.init();
  }

  // Initialize dark mode
  initializeDarkMode();

  // Initialize language switcher (only if translation system is not available)
  if (typeof i18n === 'undefined') {
    initializeLanguageSwitcher();
  }

  // Form validation
  initializeFormValidation();

  // Feature card interactions
  initializeFeatureCards();

  // Initialize navigation
  initializeNavigation();
});

// Dark Mode Toggle Functionality
function initializeDarkMode() {
  const body = document.body;
  const darkModeToggle = document.getElementById('darkModeToggle');

  console.log('Initializing dark mode...');
  console.log('Dark mode toggle element:', darkModeToggle);

  if (!darkModeToggle) {
    console.error('Dark mode toggle not found!');
    return;
  }

  // Check for saved theme preference
  const savedDarkMode = localStorage.getItem('darkMode');
  console.log('Saved dark mode preference:', savedDarkMode);
  
  if (savedDarkMode === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.classList.add('active');
    console.log('Dark mode enabled from saved preference');
  } else {
    console.log('Dark mode disabled - using light mode');
  }

  // Toggle dark mode on click
  darkModeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Dark mode toggle clicked');
    
    body.classList.toggle('dark-mode');
    darkModeToggle.classList.toggle('active');
    
    const isDarkMode = body.classList.contains('dark-mode');
    console.log('Dark mode is now:', isDarkMode ? 'enabled' : 'disabled');
    
    // Save preference
    if (isDarkMode) {
      localStorage.setItem('darkMode', 'enabled');
    } else {
      localStorage.setItem('darkMode', 'disabled');
    }
    
    // Force a repaint to ensure logo transitions work
    body.offsetHeight;
    
    // Add a small delay to ensure smooth logo transition
    setTimeout(() => {
      // Trigger a repaint for logo elements
      const logos = document.querySelectorAll('.site-logo img');
      logos.forEach(logo => {
        logo.style.transition = 'none';
        logo.offsetHeight; // Force repaint
        logo.style.transition = '';
      });
    }, 50);
  });

  // Add keyboard support
  darkModeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      darkModeToggle.click();
    }
  });

  // Set proper ARIA attributes
  darkModeToggle.setAttribute('role', 'button');
  darkModeToggle.setAttribute('tabindex', '0');
  darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
  darkModeToggle.setAttribute('aria-pressed', body.classList.contains('dark-mode').toString());

  console.log('Dark mode initialization complete');
}

// Language Switcher Functionality
function initializeLanguageSwitcher() {
  const body = document.body;
  const languageSwitcher = document.getElementById('languageSwitcher');
  
  if (!languageSwitcher) return;

  const currentLang = languageSwitcher.querySelector('.current-lang');
  const languageOptions = languageSwitcher.querySelector('.language-options');
  const languageOption = languageSwitcher.querySelectorAll('.language-option');

  // Apply saved language preference
  const savedLang = localStorage.getItem('language');
  if (savedLang === 'bn') {
    body.classList.add('bn');
    if (currentLang) {
      currentLang.querySelector('span').textContent = 'BN';
    }
    languageOption.forEach(opt => opt.classList.remove('active'));
    const bnOption = document.querySelector('.language-option[data-lang="bn"]');
    if (bnOption) {
      bnOption.classList.add('active');
    }
  }

  // Language switcher dropdown toggle
  if (currentLang && languageOptions) {
    currentLang.addEventListener('click', () => {
      languageOptions.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!languageSwitcher.contains(e.target)) {
        languageOptions.classList.remove('show');
      }
    });
  }

  // Language option selection
  languageOption.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      localStorage.setItem('language', lang);
      
      if (currentLang) {
        currentLang.querySelector('span').textContent = lang.toUpperCase();
      }
      
      languageOption.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      if (languageOptions) {
        languageOptions.classList.remove('show');
      }
      
      if (lang === 'bn') {
        body.classList.add('bn');
      } else {
        body.classList.remove('bn');
      }
    });
  });
}

// Form Validation
function initializeFormValidation() {
  const body = document.body;
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple validation
      let valid = true;
      const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.classList.add('is-invalid');
        } else {
          input.classList.remove('is-invalid');
        }
      });
      
      if (form.closest('#registerForm')) {
        const password = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('registerConfirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
          valid = false;
          confirmPassword.classList.add('is-invalid');
          alert(body.classList.contains('bn') ? 'পাসওয়ার্ড মিলছে না!' : 'Passwords do not match!');
        }
        
        const agreeTerms = document.getElementById('agreeTerms');
        if (agreeTerms && !agreeTerms.checked) {
          valid = false;
          alert(body.classList.contains('bn') ? 'শর্তাবলী মেনে নিতে হবে!' : 'You must agree to the Terms & Conditions!');
        }
      }      if (valid) {
        // Form is valid - actual authentication will be handled by auth system
        // No fake success messages - let the real auth handle this
        console.log('Form validation passed, awaiting real authentication...');
      }
    });
  });
}

// Feature Cards Interactions
function initializeFeatureCards() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove active class from all cards
      featureCards.forEach(c => c.classList.remove('active'));
      // Add active class to the clicked card
      card.classList.add('active');
    });
  });
}

// Enhanced Navigation Active State Management
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Function to update active navigation link
  function updateActiveNavLink(activeId) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      }
    });
  }

  // Handle click events on navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't prevent default for external links
      if (link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Smooth scroll to target section
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Update active link based on scroll position
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100; // Offset for navbar height
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      updateActiveNavLink(current);
    }
  });

  // Set initial active state based on current scroll position or URL hash
  const hash = window.location.hash.substring(1);
  if (hash) {
    updateActiveNavLink(hash);
  } else {
    // Default to home if no hash
    updateActiveNavLink('home');
  }
}
