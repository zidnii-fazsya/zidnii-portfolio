import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
    ArrowRight,
    BookOpen,
    Loader2,
    Code2,
    FolderKanban,
    MonitorCog,
    Sparkles,
    X,
} from 'lucide-react';

import '../../css/about.css';

import CircularCarousel from './Components/CircularCarousel';
import { useLanguage } from '../utils/useLanguage';

/*
|--------------------------------------------------------------------------
| BIO PANJANG
|--------------------------------------------------------------------------
| Jika bio lebih panjang dari batas ini, teks di halaman About dipotong
| dan tombol detail ditampilkan.
*/

const BIO_PREVIEW_LIMIT = 260;

const DEFAULT_BIO =
    'Saya adalah lulusan D3 Sistem Informasi Universitas Telkom yang memiliki minat pada teknologi informasi, pengembangan aplikasi web, analisis sistem, dan pengelolaan proyek.';

export default function About() {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBioOpen, setIsBioOpen] = useState(false);

    const text = {
        readMore: isEnglish ? 'View Details' : 'Lihat Detail',
        modalEyebrow: isEnglish ? 'ABOUT ME' : 'TENTANG SAYA',
        modalTitle: isEnglish ? 'My Full Story' : 'Cerita Lengkap Saya',
        modalSubtitle: isEnglish
            ? 'The complete narrative about me.'
            : 'Narasi lengkap tentang diri saya.',
        close: isEnglish ? 'Close' : 'Tutup',
        closeLabel: isEnglish ? 'Close dialog' : 'Tutup jendela',
    };

    /* =========================================================
       FETCH PROFILE
    ========================================================= */

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil data profil.');
                }

                const data = await response.json();

                setProfile(data?.profile || null);
            } catch (err) {
                if (err.name === 'AbortError') return;

                setError(
                    err?.message ||
                    'Terjadi kesalahan saat mengambil data profil.'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => controller.abort();
    }, []);

    /* =========================================================
       MODAL: LOCK SCROLL + TOMBOL ESCAPE
    ========================================================= */

    useEffect(() => {
        if (!isBioOpen) return undefined;

        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsBioOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isBioOpen]);

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <section id="about" className="visitor-about">
                <div className="visitor-about-loading">
                    <Loader2 size={28} className="visitor-loading-icon" />
                    <span>{t.about.loading}</span>
                </div>
            </section>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <section id="about" className="visitor-about">
                <div className="visitor-about-error">
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    /* =========================================================
       BIO
    ========================================================= */

    const bio = String(profile?.bio || '').trim() || DEFAULT_BIO;
    const isBioLong = bio.length > BIO_PREVIEW_LIMIT;

    /* =========================================================
       PROFILE TAGS
       Data dari profiles.tag, contoh:
       "Web Developer | IT System Analyst | IT Project Management"
    ========================================================= */

    const profileTags = String(profile?.tag || '')
        .split('|')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');

    /* =========================================================
       ICON UNTUK SETIAP TAG
    ========================================================= */

    const getInterestIcon = (tag) => {
        const value = String(tag || '').toLowerCase();

        if (
            value.includes('web') ||
            value.includes('developer') ||
            value.includes('development')
        ) {
            return Code2;
        }

        if (value.includes('project') || value.includes('management')) {
            return FolderKanban;
        }

        if (
            value.includes('system') ||
            value.includes('analyst') ||
            value.includes('analysis')
        ) {
            return MonitorCog;
        }

        return Sparkles;
    };

    /* =========================================================
       ABOUT PHOTOS (maksimal 5)
       profile.photos = [{ id, image: "image/about/me 2.jpeg", order }]
    ========================================================= */

    const aboutPhotos = Array.isArray(profile?.photos)
        ? profile.photos
              .filter((photo) => photo && photo.image)
              .slice()
              .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
              .slice(0, 5)
              .map((photo, index) => {
                  const imagePath = String(photo.image)
                      .trim()
                      .replace(/^\/+/, '');

                  return {
                      id: photo.id ?? `about-photo-${index}`,
                      src: `/${imagePath}`,
                      alt: `Foto About ${index + 1}`,
                      title: `About ${index + 1}`,
                      subtitle: 'Zidnii Lu’lu Fazsya',
                  };
              })
        : [];

    /* =========================================================
       MODAL NARASI LENGKAP
    ========================================================= */

    const renderBioModal = () => {
        if (!isBioOpen) return null;

        const modal = (
            <div
                className="visitor-about-modal-backdrop"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        setIsBioOpen(false);
                    }
                }}
            >
                <section
                    className="visitor-about-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="visitor-about-modal-title"
                >
                    <header className="visitor-about-modal-header">
                        <div className="visitor-about-modal-heading">
                            <span className="visitor-about-modal-icon">
                                <BookOpen size={22} />
                            </span>

                            <div>
                                <span className="visitor-about-modal-eyebrow">
                                    {text.modalEyebrow}
                                </span>

                                <h3 id="visitor-about-modal-title">
                                    {text.modalTitle}
                                </h3>

                                <p>{text.modalSubtitle}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="visitor-about-modal-close"
                            onClick={() => setIsBioOpen(false)}
                            aria-label={text.closeLabel}
                            title={text.closeLabel}
                            autoFocus
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <div className="visitor-about-modal-body">
                        <p className="visitor-about-modal-text">{bio}</p>

                        {profileTags.length > 0 && (
                            <div className="visitor-about-modal-tags">
                                <h4>{t.about.interests}</h4>

                                <div className="visitor-about-modal-tag-list">
                                    {profileTags.map((tag, index) => (
                                        <span
                                            key={`${tag}-${index}`}
                                            className="visitor-about-modal-tag"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <footer className="visitor-about-modal-footer">
                        <button
                            type="button"
                            className="visitor-about-modal-close-button"
                            onClick={() => setIsBioOpen(false)}
                        >
                            <X size={16} />
                            {text.close}
                        </button>
                    </footer>
                </section>
            </div>
        );

        // Portal: modal selalu berada di atas navbar.
        return createPortal(modal, document.body);
    };

    /* =========================================================
       ABOUT SECTION
    ========================================================= */

    return (
        <>
            <section id="about" className="visitor-about">
                <div className="visitor-about-container">
                    {/* LEFT CONTENT */}

                    <div className="visitor-about-content">
                        <span className="visitor-about-label">
                            {t.about.eyebrow}
                        </span>

                        <h2 className="visitor-about-title">
                            {t.about.title}
                        </h2>

                        <div className="visitor-about-line"></div>

                        {/* BIO (DIPOTONG JIKA PANJANG) */}

                        <p
                            className={[
                                'visitor-about-description',
                                isBioLong
                                    ? 'visitor-about-description--clamped'
                                    : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {bio}
                        </p>

                        {isBioLong && (
                            <button
                                type="button"
                                className="visitor-about-more"
                                onClick={() => setIsBioOpen(true)}
                                aria-haspopup="dialog"
                            >
                                {text.readMore}
                                <ArrowRight size={16} />
                            </button>
                        )}

                        {/* INTERESTS */}

                        <div className="visitor-about-interests">
                            <h3>{t.about.interests}</h3>

                            <div className="visitor-interest-list">
                                {profileTags.length > 0 ? (
                                    profileTags.map((tag, index) => {
                                        const Icon = getInterestIcon(tag);

                                        return (
                                            <div
                                                className="visitor-interest-item"
                                                key={`${tag}-${index}`}
                                            >
                                                <div className="visitor-interest-icon">
                                                    <Icon size={20} />
                                                </div>

                                                <span>{tag}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="visitor-interest-item">
                                        <div className="visitor-interest-icon">
                                            <Sparkles size={20} />
                                        </div>

                                        <span>Information Technology</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BUTTON */}

                        <a
                            href="#experience"
                            className="visitor-about-button"
                        >
                            {t.about.button}
                            <ArrowRight size={18} />
                        </a>
                    </div>

                    {/* RIGHT CONTENT */}

                    <div className="visitor-about-carousel">
                        <div className="visitor-about-carousel-label">
                            <span>{t.about.photos}</span>
                        </div>

                        {aboutPhotos.length > 0 ? (
                            <CircularCarousel
                                items={aboutPhotos}
                                preset="cylinder"
                                intro="rise"
                                cardWidth={300}
                                aspectRatio={1}
                                speed={14}
                                captions={false}
                                gap={30}
                                tilt={-5}
                                curve={0}
                                perspective={2500}
                                autoplay="drift"
                                interval={3}
                                direction="left"
                                momentum={0.6}
                                snap
                                pauseOnHover
                                focusOnClick
                                draggable
                                parallax={0.15}
                                stretch={0.5}
                                fadeColor="transparent"
                                depthFade={0.25}
                                innerShade={0}
                                cornerRadius={0}
                            />
                        ) : (
                            <div className="visitor-carousel-empty">
                                <div className="visitor-carousel-empty-icon">
                                    +
                                </div>

                                <p>Belum ada foto About</p>

                                <span>
                                    Tambahkan maksimal 5 foto melalui halaman
                                    Profile Admin.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {renderBioModal()}
        </>
    );
}