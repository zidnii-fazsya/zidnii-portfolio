import React, { useEffect, useState } from 'react';
import {
    GraduationCap,
    CalendarDays,
    Award,
    ArrowRight,
    X,
    BookOpen,
} from 'lucide-react';

import '../../css/visitor-education.css';
import useLanguage from '../utils/useLanguage';

/*
|--------------------------------------------------------------------------
| HELPER URL LOGO
|--------------------------------------------------------------------------
*/

const getLogoUrl = (logo) => {
    if (!logo) return '';

    const value = String(logo).trim();

    if (/^(https?:\/\/|data:|blob:)/i.test(value)) {
        return value;
    }

    return `/storage/${value.replace(/^\/+/, '')}`;
};

export default function VisitorEducation() {
    const { t } = useLanguage();
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEducation, setSelectedEducation] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | FETCH EDUCATION DATA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const fetchEducations = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch('/api/educations', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil data pendidikan.');
                }

                const data = await response.json();

                setEducations(
                    Array.isArray(data.educations) ? data.educations : []
                );
            } catch (err) {
                if (err.name === 'AbortError') {
                    return;
                }

                console.error('Education fetch error:', err);

                setError(
                    err.message ||
                    'Terjadi kesalahan saat mengambil data pendidikan.'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchEducations();

        return () => {
            controller.abort();
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | OPEN AND CLOSE DETAIL
    |--------------------------------------------------------------------------
    */

    const handleOpenDetail = (education) => {
        setSelectedEducation(education);
    };

    const handleCloseDetail = () => {
        setSelectedEducation(null);
    };

    /*
    |--------------------------------------------------------------------------
    | MODAL KEYBOARD AND SCROLL ACCESSIBILITY
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!selectedEducation) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedEducation(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedEducation]);

    /*
    |--------------------------------------------------------------------------
    | FORMAT EDUCATION PERIOD
    |--------------------------------------------------------------------------
    */

    const formatPeriod = (education) => {
        const startYear = education.start_year || '-';
        const endYear = education.end_year || '-';

        return `${startYear} – ${endYear}`;
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <main className="visitor-education">
            {/* HERO */}

            <section className="education-hero">
                <span className="education-eyebrow">
                    {t.education.eyebrow}
                </span>

                <h1>
                    {t.education.title}
                </h1>

                <p>{t.education.subtitle}</p>
            </section>

            {/* EDUCATION CONTENT */}

            <section
                className="education-content"
                aria-label="Education history"
            >
                {/* LOADING */}

                {loading && (
                    <div className="education-status" role="status">
                        <span className="education-loading-spinner" />
                        <p>{t.education.loading}</p>
                    </div>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div
                        className="education-status education-error"
                        role="alert"
                    >
                        <GraduationCap size={30} />
                        <p>{error}</p>
                    </div>
                )}

                {/* EMPTY STATE */}

                {!loading && !error && educations.length === 0 && (
                    <div className="education-empty">
                        <GraduationCap size={38} />
                        <h3>{t.education.empty}</h3>
                    </div>
                )}

                {/* EDUCATION LIST (2 KOLOM: KIRI & KANAN) */}

                {!loading && !error && educations.length > 0 && (
                    <div className="education-timeline">
                        {educations.map((item, index) => (
                            <article
                                className="education-card"
                                key={item.id ?? `education-${index}`}
                            >
                                {/* INSTITUTION LOGO */}

                                <div className="education-card-logo">
                                    {item.logo ? (
                                        <img
                                            src={getLogoUrl(item.logo)}
                                            alt={`${item.institution} logo`}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <GraduationCap
                                            size={24}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>

                                {/* EDUCATION INFORMATION */}

                                <div className="education-card-body">
                                    {/* TITLE AND GRADE */}

                                    <div className="education-card-top">
                                        <div className="education-card-heading">
                                            <h3>{item.institution}</h3>

                                            <p className="education-degree">
                                                {item.degree}
                                            </p>
                                        </div>

                                        {item.final_grade && (
                                            <div className="education-grade">
                                                <Award
                                                    size={14}
                                                    aria-hidden="true"
                                                />

                                                <span>{item.final_grade}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* PERIOD */}

                                    <div className="education-period">
                                        <CalendarDays
                                            size={14}
                                            aria-hidden="true"
                                        />

                                        <span>{formatPeriod(item)}</span>
                                    </div>

                                    {/* DESCRIPTION PREVIEW */}

                                    {item.description && (
                                        <div className="education-description-wrapper">
                                            <p className="education-description">
                                                {item.description}
                                            </p>

                                            <button
                                                type="button"
                                                className="education-detail-button"
                                                onClick={() =>
                                                    handleOpenDetail(item)
                                                }
                                                aria-label={`${t.education.viewDetail} ${item.institution}`}
                                            >
                                                <span>
                                                    {t.education.viewDetail}
                                                </span>

                                                <ArrowRight
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* EDUCATION DETAIL MODAL */}

            {selectedEducation && (
                <div
                    className="education-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseDetail();
                        }
                    }}
                >
                    <section
                        className="education-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="education-modal-title"
                    >
                        {/* MODAL HEADER */}

                        <header className="education-modal-header">
                            <div className="education-modal-heading">
                                <span className="education-modal-eyebrow">
                                    {t.education.modalEyebrow}
                                </span>

                                <h2 id="education-modal-title">
                                    {t.education.modalTitle}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="education-modal-close"
                                onClick={handleCloseDetail}
                                aria-label="Tutup detail pendidikan"
                                title="Close"
                                autoFocus
                            >
                                <X size={20} />
                            </button>
                        </header>

                        {/* MODAL BODY */}

                        <div className="education-modal-body">
                            {/* INSTITUTION PROFILE */}

                            <div className="education-detail-profile">
                                <div className="education-detail-logo">
                                    {selectedEducation.logo ? (
                                        <img
                                            src={getLogoUrl(selectedEducation.logo)}
                                            alt={`${selectedEducation.institution} logo`}
                                        />
                                    ) : (
                                        <GraduationCap
                                            size={34}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>

                                <div className="education-detail-profile-info">
                                    <h3>{selectedEducation.institution}</h3>
                                    <p>{selectedEducation.degree}</p>
                                </div>
                            </div>

                            {/* EDUCATION METADATA */}

                            <div className="education-detail-grid">
                                <div className="education-detail-item">
                                    <span className="education-detail-label">
                                        {t.education.institution}
                                    </span>

                                    <p className="education-detail-value">
                                        {selectedEducation.institution || '-'}
                                    </p>
                                </div>

                                <div className="education-detail-item">
                                    <span className="education-detail-label">
                                        {t.education.period}
                                    </span>

                                    <p className="education-detail-value">
                                        {formatPeriod(selectedEducation)}
                                    </p>
                                </div>

                                <div className="education-detail-item">
                                    <span className="education-detail-label">
                                        {t.education.degree}
                                    </span>

                                    <p className="education-detail-value">
                                        {selectedEducation.degree || '-'}
                                    </p>
                                </div>

                                <div className="education-detail-item">
                                    <span className="education-detail-label">
                                        {t.education.grade}
                                    </span>

                                    <p className="education-detail-value">
                                        {selectedEducation.final_grade || '-'}
                                    </p>
                                </div>
                            </div>

                            {/* FULL DESCRIPTION */}

                            <div className="education-detail-description">
                                <div className="education-detail-description-heading">
                                    <BookOpen size={19} aria-hidden="true" />
                                    <h3>{t.education.description}</h3>
                                </div>

                                <p>
                                    {selectedEducation.description?.trim()
                                        ? selectedEducation.description
                                        : t.education.noDescription}
                                </p>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}

                        <footer className="education-modal-footer">
                            <button
                                type="button"
                                className="education-modal-close-button"
                                onClick={handleCloseDetail}
                            >
                                {t.education.close}
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </main>
    );
}