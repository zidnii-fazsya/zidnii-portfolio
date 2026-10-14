import React, { useEffect, useState } from 'react';

export default function LanguageSwitcher() {

    /*
    |--------------------------------------------------------------------------
    | DEFAULT LANGUAGE
    |--------------------------------------------------------------------------
    */

    const [language, setLanguage] = useState(() => {
        if (typeof window === 'undefined') {
            return 'id';
        }

        return (
            localStorage.getItem('portfolio-language') ||
            'id'
        );
    });


    /*
    |--------------------------------------------------------------------------
    | SAVE LANGUAGE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        localStorage.setItem(
            'portfolio-language',
            language
        );

        /*
        | Custom event agar component lain
        | dapat mengetahui perubahan bahasa.
        */

        window.dispatchEvent(
            new CustomEvent(
                'portfolio-language-change',
                {
                    detail: language,
                }
            )
        );

    }, [language]);


    /*
    |--------------------------------------------------------------------------
    | CHANGE LANGUAGE
    |--------------------------------------------------------------------------
    */

    const handleLanguageChange = (
        selectedLanguage
    ) => {

        if (
            selectedLanguage === language
        ) {
            return;
        }

        setLanguage(
            selectedLanguage
        );
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="language-switcher"
            aria-label="Language selector"
            role="group"
        >

            {/* =====================================================
                INDONESIA
            ====================================================== */}

            <button
                type="button"
                className={`
                    language-option
                    ${
                        language === 'id'
                            ? 'active'
                            : ''
                    }
                `}
                onClick={() =>
                    handleLanguageChange('id')
                }
                aria-label="Bahasa Indonesia"
                aria-pressed={
                    language === 'id'
                }
            >

                <span
                    className="language-flag"
                    aria-hidden="true"
                >
                    🇮🇩
                </span>

                <span className="language-code">
                    ID
                </span>

            </button>


            {/* =====================================================
                SEPARATOR
            ====================================================== */}

            <span
                className="language-separator"
                aria-hidden="true"
            >
                |
            </span>


            {/* =====================================================
                ENGLISH
            ====================================================== */}

            <button
                type="button"
                className={`
                    language-option
                    ${
                        language === 'en'
                            ? 'active'
                            : ''
                    }
                `}
                onClick={() =>
                    handleLanguageChange('en')
                }
                aria-label="English"
                aria-pressed={
                    language === 'en'
                }
            >

                <span className="language-code">
                    EN
                </span>

                <span
                    className="language-flag"
                    aria-hidden="true"
                >
                    🇬🇧
                </span>

            </button>

        </div>
    );
}