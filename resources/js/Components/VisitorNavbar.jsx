import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { Menu, X } from 'lucide-react';

import '../../css/visitor-navbar.css';

import LanguageSwitcher from './LanguageSwitcher';
import RubberSegment from '../visitor/Components/RubberSegment';
import { useLanguage } from '../utils/useLanguage';

const menuItems = [
    'Home',
    'About',
    'Experience',
    'Education',
    'Skills',
    'Projects',
];

const sectionIds = [
    'home',
    'about',
    'experience',
    'education',
    'skills',
    'projects',
];

/*
| Menangani beberapa kemungkinan format nilai yang dikirim RubberSegment:
| String, Number, { value }, { index }
*/
function resolveMenuIndex(value, index) {
    if (typeof value === 'string') {
        const matchedIndex = menuItems.findIndex(
            (item) => item.toLowerCase() === value.toLowerCase()
        );

        if (matchedIndex !== -1) {
            return matchedIndex;
        }
    }

    if (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 0 &&
        value < menuItems.length
    ) {
        return value;
    }

    if (value && typeof value === 'object') {
        if (typeof value.value === 'string') {
            const matchedIndex = menuItems.findIndex(
                (item) =>
                    item.toLowerCase() === value.value.toLowerCase()
            );

            if (matchedIndex !== -1) {
                return matchedIndex;
            }
        }

        if (
            Number.isInteger(value.index) &&
            value.index >= 0 &&
            value.index < menuItems.length
        ) {
            return value.index;
        }
    }

    if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < menuItems.length
    ) {
        return index;
    }

    return -1;
}

export default function VisitorNavbar() {
    const { t } = useLanguage();

    const [activeMenu, setActiveMenu] = useState('Home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = useMemo(() => {
        const navTranslations = t?.nav || {};

        return menuItems.map((item) => ({
            value: item,
            label: navTranslations[item] || item,
        }));
    }, [t]);

    const activeIndex = menuItems.indexOf(activeMenu);

    /* ---------------- SCROLL TO SECTION ---------------- */

    const scrollToSection = useCallback((sectionId) => {
        const target = document.getElementById(sectionId);

        if (!target) {
            console.warn(
                `Section dengan ID "${sectionId}" tidak ditemukan.`
            );

            return false;
        }

        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        window.history.replaceState(null, '', `#${sectionId}`);

        return true;
    }, []);

    /* ---------------- NAVIGATION HANDLER ---------------- */

    const handleNavigation = useCallback(
        (value, index) => {
            const resolvedIndex = resolveMenuIndex(value, index);

            if (resolvedIndex === -1) {
                console.warn(
                    'RubberSegment mengirim nilai menu yang tidak dikenali:',
                    value,
                    index
                );

                return;
            }

            const selectedMenu = menuItems[resolvedIndex];
            const selectedSection = sectionIds[resolvedIndex];

            setActiveMenu(selectedMenu);
            setIsMobileMenuOpen(false);

            scrollToSection(selectedSection);
        },
        [scrollToSection]
    );

    /* ---------------- LOGO ---------------- */

    const handleLogoClick = useCallback(
        (event) => {
            event.preventDefault();

            setActiveMenu('Home');
            setIsMobileMenuOpen(false);

            scrollToSection('home');
        },
        [scrollToSection]
    );

    /* ---------------- MOBILE MENU ---------------- */

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen((previous) => !previous);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    /* Tutup menu saat resize ke desktop atau tekan Escape */

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    /* Kunci scroll body saat menu mobile terbuka */

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    /* ---------------- SCROLL SPY ---------------- */

    useEffect(() => {
        let animationFrame = null;

        const updateActiveSection = () => {
            const navbar = document.querySelector('.visitor-navbar');

            const navbarHeight = navbar
                ? navbar.getBoundingClientRect().height
                : 0;

            const activationPoint = navbarHeight + 100;

            let currentSection = sectionIds[0];

            sectionIds.forEach((sectionId) => {
                const section = document.getElementById(sectionId);

                if (!section) {
                    return;
                }

                if (section.getBoundingClientRect().top <= activationPoint) {
                    currentSection = sectionId;
                }
            });

            const currentIndex = sectionIds.indexOf(currentSection);

            if (currentIndex !== -1) {
                setActiveMenu((previous) => {
                    const nextMenu = menuItems[currentIndex];

                    return previous === nextMenu ? previous : nextMenu;
                });
            }
        };

        const handleScroll = () => {
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }

            animationFrame = window.requestAnimationFrame(
                updateActiveSection
            );
        };

        updateActiveSection();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);

            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, []);

    /* ---------------- HASH SYNC ---------------- */

    useEffect(() => {
        const syncHash = () => {
            const currentHash = window.location.hash.replace('#', '');
            const currentIndex = sectionIds.indexOf(currentHash);

            if (currentIndex !== -1) {
                setActiveMenu(menuItems[currentIndex]);
            }
        };

        syncHash();

        window.addEventListener('hashchange', syncHash);

        return () => {
            window.removeEventListener('hashchange', syncHash);
        };
    }, []);

    /* ---------------- RENDER ---------------- */

    return (
        <>
            <header
                className={
                    isMobileMenuOpen
                        ? 'visitor-navbar is-mobile-open'
                        : 'visitor-navbar'
                }
            >
                <div className="visitor-navbar-inner">
                    {/* LOGO */}
                    <a
                        href="#home"
                        className="visitor-logo"
                        onClick={handleLogoClick}
                        aria-label="Go to Home"
                    >
                        ZIDNII
                    </a>

                    {/* DESKTOP NAVIGATION */}
                    <nav
                        className="visitor-nav visitor-nav-desktop"
                        aria-label="Main navigation"
                    >
                        <RubberSegment
                            items={navItems}
                            activeIndex={activeIndex >= 0 ? activeIndex : 0}
                            onChange={handleNavigation}
                        />
                    </nav>

                    {/* ACTIONS */}
                    <div className="visitor-navbar-actions">
                        <div className="visitor-language-wrapper">
                            <LanguageSwitcher />
                        </div>

                        <button
                            type="button"
                            className="visitor-mobile-toggle"
                            onClick={toggleMobileMenu}
                            aria-label={
                                isMobileMenuOpen
                                    ? 'Tutup navigasi'
                                    : 'Buka navigasi'
                            }
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X size={21} aria-hidden="true" />
                            ) : (
                                <Menu size={21} aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/*
              Backdrop & panel sengaja BERADA DI LUAR <header>.
              Jika di dalam header yang punya backdrop-filter, elemen
              position: fixed akan berpatokan ke header, bukan ke layar.
            */}

            <div
                className={
                    isMobileMenuOpen
                        ? 'visitor-mobile-backdrop is-visible'
                        : 'visitor-mobile-backdrop'
                }
                onClick={closeMobileMenu}
                aria-hidden="true"
            />

            {/* Pakai <div>, bukan <nav>, agar tidak terkena `.visitor-home nav` */}
            <div
                className={
                    isMobileMenuOpen
                        ? 'visitor-mobile-panel is-open'
                        : 'visitor-mobile-panel'
                }
                role="navigation"
                aria-label="Navigasi mobile"
                aria-hidden={!isMobileMenuOpen}
            >
                <div className="visitor-mobile-panel-header">
                    <span className="visitor-mobile-panel-tag">MENU</span>

                    <span className="visitor-mobile-panel-status">
                        {activeMenu}
                    </span>
                </div>

                <ul className="visitor-mobile-menu-list">
                    {navItems.map((item, index) => {
                        const isActive = menuItems[index] === activeMenu;

                        return (
                            <li
                                key={item.value}
                                className="visitor-mobile-menu-item"
                            >
                                <button
                                    type="button"
                                    className={
                                        isActive
                                            ? 'visitor-mobile-menu-btn is-active'
                                            : 'visitor-mobile-menu-btn'
                                    }
                                    onClick={() =>
                                        handleNavigation(item.value, index)
                                    }
                                    tabIndex={isMobileMenuOpen ? 0 : -1}
                                >
                                    <span className="visitor-mobile-item-index">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>

                                    <span className="visitor-mobile-item-label">
                                        {item.label}
                                    </span>

                                    {isActive && (
                                        <span className="visitor-mobile-active-indicator" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}