// Translation system for Jante ChAi
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // Navbar
                'nav.home': 'Home',
                'nav.features': 'Features',
                'nav.services': 'Services',
                'nav.demo': 'Demo',
                'nav.login': 'Login/Register',
                
                // Hero Section
                'hero.title': 'Jante ChAi',
                'hero.subtitle': 'Access government services at your fingertips. Get information about National ID, Passport, Birth Certificate, License, and Tax services easily through our platform.',
                'hero.btn.services': 'View Services',
                'hero.btn.account': 'Create Account',
                
                // Service badges
                'badge.nid': 'National ID',
                'badge.passport': 'Passport',
                'badge.birth': 'Birth Certificate',
                
                // Features Section
                'features.title': 'Why Choose',
                'features.subtitle': 'Discover our unique features that make us special',
                'features.save_time.title': 'Save Time',
                'features.save_time.desc': 'No more waiting in lines. Get government services in just a few minutes through our platform.',
                'features.smart_search.title': 'Smart Search',
                'features.smart_search.desc': 'Our advanced search system helps you quickly find the information you need.',
                'features.secure.title': 'Secure Access',
                'features.secure.desc': 'Your personal information is always protected. We follow the highest security standards.',
                'features.mobile.title': 'Mobile Ready',
                'features.mobile.desc': 'Use our services from any device. Our website is completely mobile-friendly.',
                'features.user_friendly.title': 'User Friendly',
                'features.user_friendly.desc': 'Easy interface and Bengali language support will help you use the service easily.',
                'features.ai_chat.title': 'AI Chat Assistant',
                'features.ai_chat.desc': 'Get instant answers to your questions through our intelligent chatbot.',
                
                // Services Section
                'services.title': 'Government Services',
                'services.subtitle': 'Access all essential government services in one place',
                
                // Demo Section
                'demo.title': 'See Jante ChAi in Action',
                'demo.subtitle': 'Watch how easy it is to get government services',
                'demo.btn.demo': 'Try Demo',
                'demo.btn.start': 'Get Started',
                
                // Footer
                'footer.about': 'About Jante ChAi',
                'footer.about.desc': 'A digital platform to access government services easily and efficiently.',
                'footer.quick_links': 'Quick Links',
                'footer.contact': 'Contact Info',
                'footer.follow': 'Follow Us',
                'footer.rights': 'All rights reserved.',
                  // Common
                'common.learn_more': 'Learn More',
                'common.get_started': 'Get Started',
                'common.contact_us': 'Contact Us',
                
                // Dashboard specific
                'dashboard.welcome': 'Welcome back',
                'dashboard.overview': 'Here\'s an overview of your government services and applications',
                'dashboard.chat_assistant': 'Chat Assistant',
                'dashboard.chat_subtitle': 'Ask any questions about government services and get instant answers',
                'dashboard.my_services': 'My Services',
                'dashboard.my_applications': 'My Applications',
                'dashboard.notifications': 'Notifications',
                'dashboard.my_profile': 'My Profile',
                'dashboard.my_documents': 'My Documents',
                'dashboard.settings': 'Settings',
                'dashboard.logout': 'Logout',
                'dashboard.main': 'Main',
                'dashboard.account': 'Account'
            },
            bn: {
                // Navbar
                'nav.home': 'হোম',
                'nav.features': 'বৈশিষ্ট্য',
                'nav.services': 'সেবাসমূহ',
                'nav.demo': 'ডেমো',
                'nav.login': 'লগইন/রেজিস্টার',
                
                // Hero Section
                'hero.title': 'জানতে চাই',
                'hero.subtitle': 'সরকারি তথ্য এবং সেবাসমূহ এখন আপনার হাতের মুঠোয়। আমাদের প্ল্যাটফর্মে আপনি সহজেই জাতীয় পরিচয়পত্র, পাসপোর্ট, জন্ম নিবন্ধন, লাইসেন্স এবং কর সংক্রান্ত তথ্য পেতে পারেন।',
                'hero.btn.services': 'সেবাসমূহ দেখুন',
                'hero.btn.account': 'একাউন্ট খুলুন',
                
                // Service badges
                'badge.nid': 'জাতীয় পরিচয়পত্র',
                'badge.passport': 'পাসপোর্ট',
                'badge.birth': 'জন্ম নিবন্ধন',
                
                // Features Section
                'features.title': 'কেন',
                'features.subtitle': 'আমাদের অনন্য বৈশিষ্ট্যগুলি আবিষ্কার করুন',
                'features.save_time.title': 'সময় বাঁচান',
                'features.save_time.desc': 'আর লাইনে দাঁড়াতে হবে না। আমাদের প্ল্যাটফর্মে সরকারি সেবাগুলি পেতে মাত্র কয়েক মিনিট সময় লাগবে।',
                'features.smart_search.title': 'স্মার্ট সার্চ',
                'features.smart_search.desc': 'আমাদের উন্নত সার্চ সিস্টেম আপনাকে দ্রুত প্রয়োজনীয় তথ্য খুঁজে পেতে সাহায্য করবে।',
                'features.secure.title': 'নিরাপদ অ্যাক্সেস',
                'features.secure.desc': 'আপনার ব্যক্তিগত তথ্য সর্বদা সুরক্ষিত থাকবে। আমরা সর্বোচ্চ নিরাপত্তা মান অনুসরণ করি।',
                'features.mobile.title': 'মোবাইল রেডি',
                'features.mobile.desc': 'যেকোনো ডিভাইস থেকে আমাদের সেবা ব্যবহার করুন। আমাদের ওয়েবসাইট সম্পূর্ণ মোবাইল ফ্রেন্ডলি।',
                'features.user_friendly.title': 'ব্যবহারকারী বান্ধব',
                'features.user_friendly.desc': 'সহজ ইন্টারফেস এবং বাংলা ভাষার সাপোর্ট আপনাকে সেবাটি সহজে ব্যবহার করতে সাহায্য করবে।',
                'features.ai_chat.title': 'এআই চ্যাট সহায়ক',
                'features.ai_chat.desc': 'আমাদের বুদ্ধিমান চ্যাটবটের মাধ্যমে আপনার প্রশ্নের তাৎক্ষণিক উত্তর পান।',
                
                // Services Section
                'services.title': 'সরকারি সেবাসমূহ',
                'services.subtitle': 'একটি স্থানে সমস্ত প্রয়োজনীয় সরকারি সেবা অ্যাক্সেস করুন',
                
                // Demo Section
                'demo.title': 'জানতে চাই এর কার্যকারিতা দেখুন',
                'demo.subtitle': 'সরকারি সেবা পাওয়া কতটা সহজ তা দেখুন',
                'demo.btn.demo': 'ডেমো দেখুন',
                'demo.btn.start': 'শুরু করুন',
                
                // Footer
                'footer.about': 'জানতে চাই সম্পর্কে',
                'footer.about.desc': 'সরকারি সেবাসমূহ সহজ এবং দক্ষতার সাথে অ্যাক্সেস করার জন্য একটি ডিজিটাল প্ল্যাটফর্ম।',
                'footer.quick_links': 'দ্রুত লিঙ্ক',
                'footer.contact': 'যোগাযোগের তথ্য',
                'footer.follow': 'আমাদের ফলো করুন',
                'footer.rights': 'সমস্ত অধিকার সংরক্ষিত।',
                  // Common
                'common.learn_more': 'আরও জানুন',
                'common.get_started': 'শুরু করুন',
                'common.contact_us': 'যোগাযোগ করুন',
                
                // Dashboard specific
                'dashboard.welcome': 'স্বাগতম',
                'dashboard.overview': 'এখানে আপনার সরকারি সেবা এবং আবেদনের একটি সংক্ষিপ্ত বিবরণ রয়েছে',
                'dashboard.chat_assistant': 'চ্যাট সহকারী',
                'dashboard.chat_subtitle': 'সরকারি সেবা সম্পর্কে যেকোনো প্রশ্ন করুন এবং তাৎক্ষণিক উত্তর পান',
                'dashboard.my_services': 'আমার সেবাসমূহ',
                'dashboard.my_applications': 'আমার আবেদনসমূহ',
                'dashboard.notifications': 'বিজ্ঞপ্তি',
                'dashboard.my_profile': 'আমার প্রোফাইল',
                'dashboard.my_documents': 'আমার ডকুমেন্টস',
                'dashboard.settings': 'সেটিংস',
                'dashboard.logout': 'লগআউট',
                'dashboard.main': 'প্রধান',
                'dashboard.account': 'অ্যাকাউন্ট'
            }
        };
    }

    // Get translation for a key
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    // Set language
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateContent();
        this.updateLanguageUI();
    }

    // Update all content on the page
    updateContent() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Update elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });        // Update aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            element.setAttribute('aria-label', this.t(key));
        });

        // Handle english/bangla class-based content switching
        document.querySelectorAll('.english').forEach(element => {
            element.style.display = this.currentLanguage === 'en' ? '' : 'none';
        });

        document.querySelectorAll('.bangla').forEach(element => {
            element.style.display = this.currentLanguage === 'bn' ? '' : 'none';
        });
    }

    // Update language switcher UI
    updateLanguageUI() {
        const currentLangSpan = document.querySelector('.current-lang span');
        if (currentLangSpan) {
            currentLangSpan.textContent = this.currentLanguage.toUpperCase();
        }

        // Update active language option
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
        });

        // Update body class for font family
        document.body.classList.toggle('bn', this.currentLanguage === 'bn');
    }

    // Initialize translation system
    init() {
        this.updateContent();
        this.updateLanguageUI();

        // Set up language switcher event listeners
        const languageSwitcher = document.getElementById('languageSwitcher');
        if (languageSwitcher) {
            const currentLang = languageSwitcher.querySelector('.current-lang');
            const languageOptions = languageSwitcher.querySelector('.language-options');

            currentLang?.addEventListener('click', () => {
                languageOptions.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!languageSwitcher.contains(e.target)) {
                    languageOptions.classList.remove('show');
                }
            });

            document.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.getAttribute('data-lang');
                    this.setLanguage(lang);
                    languageOptions.classList.remove('show');
                });
            });
        }
    }
}

// Initialize translation manager
const i18n = new TranslationManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
}
