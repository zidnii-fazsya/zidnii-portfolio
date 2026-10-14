import { useState, useEffect } from 'react';
import { translations } from './translations';

export function useLanguage() {
    const [language, setLanguage] = useState(() => {
        if (typeof window === 'undefined') {
            return 'id';
        }

        return localStorage.getItem('portfolio-language') || 'id';
    });

    useEffect(() => {
        const handleLanguageChange = (event) => {
            if (event?.detail) {
                setLanguage(event.detail);
            }
        };

        window.addEventListener(
            'portfolio-language-change',
            handleLanguageChange
        );

        return () => {
            window.removeEventListener(
                'portfolio-language-change',
                handleLanguageChange
            );
        };
    }, []);

    const t = translations[language] || translations.id;

    return { language, t };
}

export default useLanguage;
