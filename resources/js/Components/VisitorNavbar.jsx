
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
    'Contact',
];

const sectionIds = [
    '#home',
    '#about',
    '#experience',
    '#education',
    '#skills',
    '#projects',
    '#contact',
];

function resolveMenuIndex(value, index) {
    // Gunakan index jika RubberSegment memang mengirimkannya.
    if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < menuItems.length
    ) {
        return index;
    }

    // Jika callback hanya mengirim nama menu.
    if (typeof value === 'string') {
        return menuItems.findIndex(
            (item) => item.toLowerCase() === value.toLowerCase()
        );
    }

    // Mendukung callback yang mengirim angka sebagai nilai.
    if (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 0 &&
        value < menuItems.length
    ) {
        return value;
    }

    // Mendukung object yang berisi value atau index.
    if (value && typeof value === 'object') {
        if (typeof value.value === 'string') {
            return menuItems.findIndex(
                (item) =>
                    item.toLowerCase() === value.value.toLowerCase()
            );
        }

        if (
            Number.isInteger(value.index) &&
            value.index >= 0 &&
            value.index < menuItems.length
        ) {
            return value.index;
        }
    }

    return -1;
}

export default function VisitorNavbar() {
    const { t } = useLanguage();
    const [activeMenu, setActiveMenu] = useState('Home');

    const navItems = useMemo(() => {
        return menuItems.map((item) => ({
            value: item,
            label: t.nav[item] || item,
        }));
    }, [t]);

    const activeIndex = menuItems.indexOf(activeMenu);

    /*
    |--------------------------------------------------------------------------
    | NAVIGATION HANDLER
    |--------------------------------------------------------------------------
    */

    const handleNavigation = useCallback((value, index) => {
        const resolvedIndex = resolveMenuIndex(value, index);

        if (resolvedIndex < 0) {
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

        const target = document.querySelector(selectedSection);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            // Perbarui URL tanpa memuat ulang halaman.
            window.history.replaceState(
                null,
                '',
                selectedSection
            );
        } else {
            console.warn(
                `Bagian ${selectedSection} tidak ditemukan. Pastikan ID section sesuai.`
            );
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | LOGO HANDLER
    |--------------------------------------------------------------------------
    */

    const handleLogoClick = useCallback((event) => {
        event.preventDefault();

        setActiveMenu('Home');

        const target = document.querySelector('#home');

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            window.history.replaceState(null, '', '#home');
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SCROLL SPY
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            return undefined;
        }

        const sections = sectionIds
            .map((id) => document.querySelector(id))
            .filter(Boolean);

        if (sections.length === 0) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio - a.intersectionRatio
                    );

                if (visibleSections.length === 0) {
                    return;
                }

                const activeSection =
                    visibleSections[0].target.id;

                const activeIndex = sectionIds.findIndex(
                    (sectionId) =>
                        sectionId === `#${activeSection}`
                );

                if (activeIndex !== -1) {
                    setActiveMenu(menuItems[activeIndex]);
                }
            },
            {
                root: null,
                rootMargin: '-25% 0px -60% 0px',
                threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | INITIAL HASH AND HASH CHANGES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const syncHash = () => {
            const currentHash = window.location.hash;

            const activeIndex = sectionIds.findIndex(
                (sectionId) => sectionId === currentHash
            );

            if (activeIndex !== -1) {
                setActiveMenu(menuItems[activeIndex]);
            }
        };

        syncHash();

        window.addEventListener('hashchange', syncHash);

        return () => {
            window.removeEventListener('hashchange', syncHash);
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <header className="visitor-navbar">
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

                {/* MAIN NAVIGATION */}

                <nav
                    className="visitor-nav"
                    aria-label="Main navigation"
                >
                    <RubberSegment
                        items={navItems}
                        activeIndex={activeIndex >= 0 ? activeIndex : 0}
                        value={activeMenu}
                        defaultValue="Home"
                        onChange={handleNavigation}
                        trackColor="transparent"
                        thumbColor="#3d141e"
                        textColor="rgba(255, 255, 255, 0.72)"
                        activeTextColor="#ffffff"
                        size="md"
                        radius={999}
                        inset={3}
                        equalSlots
                        stretch={100}
                        squash={3}
                        speed={1}
                        glide={75}
                        draggable
                        disabled={false}
                    />
                </nav>

                {/* LANGUAGE SWITCHER */}

                <div className="visitor-language-wrapper">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
