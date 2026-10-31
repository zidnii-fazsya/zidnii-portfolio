import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    MapPin,
    Users,
    Loader2,
    Image as ImageIcon,
    Images,
    FolderOpen,
    Layers,
    ArrowUpRight,
    X,
} from 'lucide-react';

import '../../css/visitor-experience.css';
import { useLanguage } from '../utils/useLanguage';

/* =========================================================
   HELPER: NAMA FILE GAMBAR
   Mengambil nama file asli dari path/URL gambar,
   contoh: "image/experiences/3/experience_3_abc.png"
           -> "experience_3_abc.png"
========================================================= */

const getFileNameFromPath = (rawPath) => {
    if (typeof rawPath !== 'string') return '';

    const cleanPath = rawPath
        .split('#')[0]
        .split('?')[0]
        .replace(/\\/g, '/');

    const lastSegment = cleanPath.split('/').filter(Boolean).pop() || '';

    try {
        return decodeURIComponent(lastSegment);
    } catch {
        return lastSegment;
    }
};

const firstFilled = (...values) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return '';
};

const formatCount = (count) => new Intl.NumberFormat('en-US').format(count);

export default function Experience() {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';

    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal arsip: hanya berisi dokumentasi (gambar).
    const [selectedExperience, setSelectedExperience] = useState(null);

    // Modal detail: berisi deskripsi lengkap dari admin.
    const [detailExperience, setDetailExperience] = useState(null);

    /* =========================================================
       TEKS UNTUK KARTU, MODAL ARSIP & MODAL DETAIL
    ========================================================= */

    const archiveText = {
        cardLabel: isEnglish ? 'PROJECT ARCHIVE' : 'ARSIP PROYEK',
        cardKicker: isEnglish ? 'DOCUMENTATION ARCHIVE' : 'ARSIP DOKUMENTASI',
        cardSuffix: isEnglish ? 'Archive' : 'Arsip',
        cardAction: isEnglish ? 'View Project Details' : 'Lihat Detail Proyek',
        imageCount: isEnglish ? 'images' : 'gambar',

        // Modal arsip (dokumentasi saja)
        modalEyebrow: isEnglish ? 'PROJECT COLLECTION' : 'KOLEKSI PROYEK',
        modalSubtitle: isEnglish
            ? 'Browse the documentation images below.'
            : 'Telusuri gambar dokumentasi di bawah ini.',
        docKicker: isEnglish ? 'PROJECT DOCUMENTATION' : 'DOKUMENTASI PROYEK',
        docTitle: isEnglish ? 'Project Documentation' : 'Dokumentasi Proyek',
        totalImages: isEnglish ? 'documentation images' : 'gambar dokumentasi',
        closeArchive: isEnglish ? 'Close Archive' : 'Tutup Arsip',
        closeLabel: isEnglish ? 'Close dialog' : 'Tutup jendela',
        viewImage: isEnglish ? 'Open image in a new tab' : 'Buka gambar di tab baru',
        noPhotos: t?.experience?.noPhotos || (isEnglish ? 'No images yet.' : 'Belum ada gambar.'),

        // Tombol & modal detail
        readDetail: isEnglish ? 'Read Details' : 'Baca Detail',
        detailEyebrow: isEnglish ? 'EXPERIENCE DETAIL' : 'DETAIL PENGALAMAN',
        detailKicker: isEnglish ? 'FULL DESCRIPTION' : 'DESKRIPSI LENGKAP',
        detailTitle: isEnglish ? 'Experience Description' : 'Deskripsi Pengalaman',
        detailSubtitle: isEnglish
            ? 'The complete description of this experience.'
            : 'Deskripsi lengkap dari pengalaman ini.',
        noDescription: isEnglish
            ? 'No description has been added yet.'
            : 'Belum ada deskripsi.',
        closeDetail: isEnglish ? 'Close' : 'Tutup',

        organization: isEnglish ? 'Company / Organization' : 'Perusahaan / Organisasi',
        location: isEnglish ? 'Location' : 'Lokasi',
        period: isEnglish ? 'Period' : 'Periode',
        technologies: isEnglish ? 'Technologies & Skills' : 'Teknologi & Keahlian',
    };

    /* =========================================================
       FETCH EXPERIENCE DARI API
    ========================================================= */

    useEffect(() => {
        const controller = new AbortController();

        const fetchExperiences = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch('/api/experiences', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil data experience.');
                }

                const data = await response.json();

                const experienceData = Array.isArray(data?.experiences)
                    ? data.experiences
                    : Array.isArray(data)
                        ? data
                        : [];

                setExperiences(experienceData);
            } catch (err) {
                if (err.name === 'AbortError') return;

                console.error('Experience API Error:', err);

                setError(
                    err?.message ||
                    'Terjadi kesalahan saat mengambil data experience.'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchExperiences();

        return () => controller.abort();
    }, []);

    /* =========================================================
       LOCK SCROLL & TOMBOL ESCAPE UNTUK KEDUA MODAL
    ========================================================= */

    const isModalOpen = Boolean(selectedExperience || detailExperience);

    useEffect(() => {
        if (!isModalOpen) return undefined;

        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedExperience(null);
                setDetailExperience(null);
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

    const openArchive = (experience) => setSelectedExperience(experience);
    const closeArchive = () => setSelectedExperience(null);

    const openDetail = (experience) => setDetailExperience(experience);
    const closeDetail = () => setDetailExperience(null);

    /* =========================================================
       PISAHKAN EXPERIENCE BERDASARKAN JENIS
    ========================================================= */

    const workExperiences = experiences.filter(
        (experience) => experience?.type === 'work'
    );

    const organizationExperiences = experiences.filter(
        (experience) => experience?.type === 'organization'
    );

    /* =========================================================
       DATE HELPERS
    ========================================================= */

    const getDateOnly = (date) => {
        if (!date) return null;

        const value = String(date).trim();

        if (value.length < 10) return null;

        return value.slice(0, 10);
    };

    const formatMonthYear = (date) => {
        const dateOnly = getDateOnly(date);

        if (!dateOnly) return '';

        const [year, month] = dateOnly.split('-');
        const yearNumber = Number(year);
        const monthNumber = Number(month);

        if (!yearNumber || !monthNumber || monthNumber < 1 || monthNumber > 12) {
            return '';
        }

        const parsedDate = new Date(yearNumber, monthNumber - 1, 1);

        if (Number.isNaN(parsedDate.getTime())) return '';

        return parsedDate.toLocaleDateString(
            isEnglish ? 'en-US' : 'id-ID',
            {
                month: 'short',
                year: 'numeric',
            }
        );
    };

    const formatDateRange = (experience) => {
        const start = formatMonthYear(experience?.start_date);

        const end = experience?.is_current
            ? t.experience.present
            : formatMonthYear(experience?.end_date);

        if (!start && !end) return '';
        if (!start) return end;
        if (!end) return start;

        return `${start} – ${end}`;
    };

    /* =========================================================
       HITUNG DURASI EXPERIENCE
    ========================================================= */

    const calculateDuration = (experience) => {
        const startDateOnly = getDateOnly(experience?.start_date);

        let endDateOnly;

        if (experience?.is_current) {
            const today = new Date();

            endDateOnly = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0'),
            ].join('-');
        } else {
            endDateOnly = getDateOnly(experience?.end_date);
        }

        if (!startDateOnly || !endDateOnly) return '';

        const [startYear, startMonth] = startDateOnly.split('-').map(Number);
        const [endYear, endMonth] = endDateOnly.split('-').map(Number);

        if (!startYear || !startMonth || !endYear || !endMonth) {
            return '';
        }

        const totalMonths =
            (endYear * 12 + endMonth) -
            (startYear * 12 + startMonth) +
            1;

        if (totalMonths <= 0) return '';

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        const result = [];

        const yearLabel = years > 1 ? t.experience.years : t.experience.year;
        const monthLabel = months > 1 ? t.experience.months : t.experience.month;

        if (years > 0) result.push(`${years} ${yearLabel}`);
        if (months > 0) result.push(`${months} ${monthLabel}`);

        return result.join(' ');
    };

    /* =========================================================
       NORMALISASI TECHNOLOGIES
    ========================================================= */

    const normalizeTechnologies = (technologies) => {
        if (Array.isArray(technologies)) {
            return technologies
                .map((technology) => String(technology || '').trim())
                .filter(Boolean);
        }

        if (typeof technologies === 'string') {
            const value = technologies.trim();

            if (!value) return [];

            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed
                        .map((technology) => String(technology || '').trim())
                        .filter(Boolean);
                }
            } catch {
                // Mendukung teks biasa yang dipisahkan dengan koma.
            }

            return value
                .split(',')
                .map((technology) => technology.trim())
                .filter(Boolean);
        }

        return [];
    };

    /* =========================================================
       DATA FOTO ARSIP
       Label gambar = Nama file asli admin, atau judul arsip kegiatan jika nama file adalah UUID/tidak terbaca.
    ========================================================= */

    const isAutoGeneratedUuid = (name) => {
        if (!name || typeof name !== 'string') return true;
        const clean = name.trim();
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const expPrefixPattern = /^experience[-_]\d+[-_][0-9a-f-]+/i;
        return uuidPattern.test(clean) || expPrefixPattern.test(clean);
    };

    const getPhotoItems = (experience) => {
        if (!Array.isArray(experience?.photos)) {
            return [];
        }

        const activityName =
            experience?.position ||
            experience?.company ||
            (isEnglish ? 'Experience' : 'Kegiatan');

        return [...experience.photos]
            .filter((photo) => Boolean(photo?.image || photo?.src))
            .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
            .map((photo, index) => {
                const rawImage = String(photo.image || photo.src || '').trim();

                const image = /^https?:\/\//i.test(rawImage)
                    ? rawImage
                    : `/${rawImage.replace(/^\/+/, '')}`;

                const explicitName = firstFilled(
                    photo?.original_name,
                    photo?.original_filename,
                    photo?.file_name,
                    photo?.filename,
                    photo?.name
                );

                const pathFileName = getFileNameFromPath(rawImage);

                let label = '';

                if (explicitName && !isAutoGeneratedUuid(explicitName)) {
                    label = explicitName;
                } else if (pathFileName && !isAutoGeneratedUuid(pathFileName)) {
                    label = pathFileName;
                } else if (photo?.caption || photo?.title) {
                    label = photo.caption || photo.title;
                } else {
                    label = isEnglish
                        ? `Archive of ${activityName}`
                        : `Arsip Kegiatan ${activityName}`;
                }

                return {
                    id: photo?.id ?? `${experience?.id}-${index}`,
                    image,
                    label,
                    alt: firstFilled(photo?.alt, photo?.caption, photo?.title) || label,
                };
            });
    };

    const getLogoUrl = (experience) => {
        const logoPath = experience?.company_logo
            ? String(experience.company_logo).replace(/^\/+/, '')
            : '';

        if (!logoPath) return null;

        return /^https?:\/\//i.test(logoPath)
            ? logoPath
            : `/storage/${logoPath}`;
    };

    /* =========================================================
       RENDER TECHNOLOGIES
    ========================================================= */

    const renderTechnologies = (technologies) => {
        const technologyList = normalizeTechnologies(technologies);

        if (technologyList.length === 0) return null;

        return (
            <div className="visitor-experience-technologies">
                <p className="visitor-experience-label">
                    Technologies &amp; Skills
                </p>

                <div className="visitor-experience-tags">
                    {technologyList.map((technology, index) => (
                        <span
                            key={`${technology}-${index}`}
                            className="visitor-experience-tag"
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    /* =========================================================
       KARTU ARSIP (KOLOM KANAN)
    ========================================================= */

    const renderArchiveCard = (experience, photoItems) => {
        const archiveTitle = experience?.position
            ? `${experience.position} ${archiveText.cardSuffix}`
            : `Experience ${archiveText.cardSuffix}`;

        const archiveDescription = experience?.company
            ? isEnglish
                ? `Documentation of my experience at ${experience.company}.`
                : `Dokumentasi pengalaman di ${experience.company}.`
            : isEnglish
                ? 'Browse the documentation of this experience.'
                : 'Lihat dokumentasi pengalaman dan kegiatan.';

        if (photoItems.length === 0) {
            return (
                <div className="visitor-experience-no-photo">
                    <ImageIcon size={30} />
                    <span>{t.experience.noPhotos}</span>
                </div>
            );
        }

        const previewImages = photoItems.slice(0, 3);

        return (
            <div className="exp-arc-card">
                <button
                    type="button"
                    className="exp-arc-card-button"
                    onClick={() => openArchive(experience)}
                    aria-label={`${archiveText.cardAction}: ${archiveTitle}`}
                    aria-haspopup="dialog"
                >
                    <div
                        className={`exp-arc-preview exp-arc-preview--${previewImages.length}`}
                    >
                        {previewImages.map((item, index) => (
                            <div
                                key={item.id != null && item.id !== false ? String(item.id) : `preview-${index}`}
                                className={`exp-arc-preview-item exp-arc-preview-item--${index + 1}`}
                            >
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading="lazy"
                                    onError={(event) => {
                                        event.currentTarget.style.visibility = 'hidden';
                                    }}
                                />
                            </div>
                        ))}

                        <div className="exp-arc-preview-shade" />

                        <span className="exp-arc-preview-label">
                            <FolderOpen size={15} />
                            {archiveText.cardLabel}
                        </span>

                        <span className="exp-arc-preview-open">
                            <ArrowUpRight size={18} />
                        </span>

                        <span className="exp-arc-preview-count">
                            <Images size={14} />
                            {formatCount(photoItems.length)} {archiveText.imageCount}
                        </span>
                    </div>

                    <div className="exp-arc-card-info">
                        <div className="exp-arc-card-heading">
                            <div className="exp-arc-card-title-wrap">
                                <span className="exp-arc-kicker">
                                    {archiveText.cardKicker}
                                </span>
                                <h4>{archiveTitle}</h4>
                            </div>

                            <span className="exp-arc-card-icon">
                                <ArrowUpRight size={17} />
                            </span>
                        </div>

                        <p className="exp-arc-card-description">
                            {archiveDescription}
                        </p>

                        <span className="exp-arc-card-action">
                            {archiveText.cardAction}
                            <ArrowUpRight size={14} />
                        </span>
                    </div>
                </button>
            </div>
        );
    };

    /* =========================================================
       RENDER SATU EXPERIENCE
    ========================================================= */

    const renderExperienceItem = (experience, index) => {
        const photoItems = getPhotoItems(experience);
        const isReversed = index % 2 === 1;
        const isOrganization = experience?.type === 'organization';
        const logoUrl = getLogoUrl(experience);
        const dateRange = formatDateRange(experience);
        const duration = calculateDuration(experience);

        return (
            <article
                key={experience?.id || `experience-${index}`}
                className={[
                    'visitor-experience-item',
                    isReversed ? 'visitor-experience-item--reverse' : '',
                ].filter(Boolean).join(' ')}
            >
                {/* KOLOM KIRI: INFORMASI EXPERIENCE */}

                <div className="visitor-experience-content">
                    <div className="visitor-experience-number">
                        {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="visitor-experience-heading">
                        <div className="visitor-experience-icon">
                            {isOrganization ? (
                                <Users size={22} />
                            ) : (
                                <BriefcaseBusiness size={22} />
                            )}
                        </div>

                        <div>
                            <p className="visitor-experience-type">
                                {isOrganization
                                    ? t.experience.orgTab
                                    : t.experience.workTab}
                            </p>

                            <h3>
                                {experience?.position || 'Untitled Position'}
                            </h3>
                        </div>
                    </div>

                    {/* COMPANY / ORGANIZATION */}

                    <div className="visitor-experience-company">
                        {logoUrl ? (
                            <div className="visitor-experience-company-logo">
                                <img
                                    src={logoUrl}
                                    alt={`${experience?.company || 'Company'} logo`}
                                    loading="lazy"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                className={[
                                    'visitor-experience-company-logo',
                                    'visitor-experience-company-logo--fallback',
                                ].join(' ')}
                            >
                                {isOrganization ? (
                                    <Users size={20} />
                                ) : (
                                    <Building2 size={20} />
                                )}
                            </div>
                        )}

                        <div>
                            <p className="visitor-experience-company-name">
                                {experience?.company || 'Company / Organization'}
                            </p>

                            {experience?.employment_type && (
                                <p className="visitor-experience-employment">
                                    {experience.employment_type}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* LOCATION, DATE, DURATION */}

                    {(experience?.location || dateRange || duration) && (
                        <div className="visitor-experience-meta">
                            {experience?.location && (
                                <div className="visitor-experience-meta-item">
                                    <MapPin size={16} />
                                    <span>{experience.location}</span>
                                </div>
                            )}

                            {dateRange && (
                                <div className="visitor-experience-meta-item">
                                    <CalendarDays size={16} />
                                    <span>{dateRange}</span>
                                </div>
                            )}

                            {duration && (
                                <span className="visitor-experience-duration">
                                    {duration}
                                </span>
                            )}
                        </div>
                    )}

                    {/* DESCRIPTION (RINGKAS) + TOMBOL BACA DETAIL */}

                    {experience?.description && (
                        <div className="visitor-experience-description">
                            <p className="visitor-experience-description-text">
                                {experience.description}
                            </p>

                            <button
                                type="button"
                                className="visitor-experience-readmore"
                                onClick={() => openDetail(experience)}
                                aria-haspopup="dialog"
                            >
                                {archiveText.readDetail}
                                <ArrowUpRight size={14} />
                            </button>
                        </div>
                    )}

                    {/* TECHNOLOGIES */}

                    {renderTechnologies(experience?.technologies)}
                </div>

                {/* KOLOM KANAN: KARTU ARSIP */}

                <div className="visitor-experience-gallery">
                    {renderArchiveCard(experience, photoItems)}
                </div>
            </article>
        );
    };

    /* =========================================================
       MODAL ARSIP (HANYA DOKUMENTASI)
    ========================================================= */

    const renderArchiveModal = () => {
        if (!selectedExperience) return null;

        const experience = selectedExperience;
        const photoItems = getPhotoItems(experience);

        const archiveTitle = experience?.position
            ? `${experience.position} ${archiveText.cardSuffix}`
            : `Experience ${archiveText.cardSuffix}`;

        const modal = (
            <div
                className="exp-arc-modal-backdrop"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        closeArchive();
                    }
                }}
            >
                <section
                    className="exp-arc-modal exp-arc-modal--wide"
                    role="dialog"
                    aria-modal="true"
                    aria-label={archiveTitle}
                >
                    <header className="exp-arc-modal-header">
                        <div className="exp-arc-modal-heading">
                            <span className="exp-arc-modal-icon">
                                <FolderOpen size={22} />
                            </span>

                            <div>
                                <span className="exp-arc-kicker">
                                    {archiveText.modalEyebrow}
                                </span>
                                <h3>{archiveTitle}</h3>
                                <p>{archiveText.modalSubtitle}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="exp-arc-modal-close"
                            onClick={closeArchive}
                            aria-label={archiveText.closeLabel}
                            title={archiveText.closeLabel}
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <div className="exp-arc-modal-body">
                        {/* DOKUMENTASI */}
                        <div className="exp-arc-gallery">
                            <div className="exp-arc-gallery-heading">
                                <div className="exp-arc-section-heading">
                                    <span className="exp-arc-section-icon">
                                        <ImageIcon size={19} />
                                    </span>

                                    <div>
                                        <span className="exp-arc-kicker">
                                            {archiveText.docKicker}
                                        </span>
                                        <h4>{archiveText.docTitle}</h4>
                                    </div>
                                </div>

                                <span className="exp-arc-gallery-count">
                                    {String(photoItems.length).padStart(2, '0')}
                                </span>
                            </div>

                            {photoItems.length > 0 ? (
                                <div className="exp-arc-image-grid">
                                    {photoItems.map((item, index) => (
                                        <figure
                                            key={item.id != null && item.id !== false ? String(item.id) : `photo-${index}`}
                                            className="exp-arc-image-card"
                                        >
                                            <a
                                                href={item.image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="exp-arc-image-link"
                                                aria-label={`${archiveText.viewImage}: ${item.label}`}
                                                title={archiveText.viewImage}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.alt}
                                                    loading="lazy"
                                                    onError={(event) => {
                                                        event.currentTarget.style.visibility =
                                                            'hidden';
                                                    }}
                                                />

                                                <span className="exp-arc-image-overlay">
                                                    <ArrowUpRight size={16} />
                                                    {archiveText.viewImage}
                                                </span>
                                            </a>

                                            <figcaption>
                                                <span className="exp-arc-image-number">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className="exp-arc-image-caption">
                                                    {item.label}
                                                </span>
                                            </figcaption>
                                        </figure>
                                    ))}
                                </div>
                            ) : (
                                <div className="exp-arc-no-images">
                                    <ImageIcon size={34} />
                                    <p>{archiveText.noPhotos}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="exp-arc-modal-footer">
                        <span className="exp-arc-modal-total">
                            <Images size={16} />
                            {formatCount(photoItems.length)} {archiveText.totalImages}
                        </span>

                        <button
                            type="button"
                            className="exp-arc-close"
                            onClick={closeArchive}
                        >
                            <X size={16} />
                            {archiveText.closeArchive}
                        </button>
                    </footer>
                </section>
            </div>
        );

        // Portal: modal selalu di atas navbar dan tidak terpotong elemen induk.
        return createPortal(modal, document.body);
    };

    /* =========================================================
       MODAL DETAIL (DESKRIPSI LENGKAP)
    ========================================================= */

    const renderDetailModal = () => {
        if (!detailExperience) return null;

        const experience = detailExperience;
        const dateRange = formatDateRange(experience);
        const duration = calculateDuration(experience);
        const technologies = normalizeTechnologies(experience?.technologies);
        const isOrganization = experience?.type === 'organization';

        const title = experience?.position || 'Untitled Position';

        const modal = (
            <div
                className="exp-arc-modal-backdrop"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        closeDetail();
                    }
                }}
            >
                <section
                    className="exp-arc-modal exp-arc-modal--detail"
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                >
                    <header className="exp-arc-modal-header">
                        <div className="exp-arc-modal-heading">
                            <span className="exp-arc-modal-icon">
                                {isOrganization ? (
                                    <Users size={22} />
                                ) : (
                                    <BriefcaseBusiness size={22} />
                                )}
                            </span>

                            <div>
                                <span className="exp-arc-kicker">
                                    {archiveText.detailEyebrow}
                                </span>
                                <h3>{title}</h3>
                                <p>{archiveText.detailSubtitle}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="exp-arc-modal-close"
                            onClick={closeDetail}
                            aria-label={archiveText.closeLabel}
                            title={archiveText.closeLabel}
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <div className="exp-arc-modal-body">
                        <div className="exp-arc-overview">
                            <div className="exp-arc-section-heading">
                                <span className="exp-arc-section-icon">
                                    <Layers size={19} />
                                </span>

                                <div>
                                    <span className="exp-arc-kicker">
                                        {archiveText.detailKicker}
                                    </span>
                                    <h4>{archiveText.detailTitle}</h4>
                                </div>
                            </div>

                            <p className="exp-arc-overview-description">
                                {experience?.description || archiveText.noDescription}
                            </p>

                            {experience?.company && (
                                <div className="exp-arc-info">
                                    <span className="exp-arc-info-icon">
                                        <Building2 size={16} />
                                    </span>
                                    <div>
                                        <strong>{archiveText.organization}</strong>
                                        <p>{experience.company}</p>
                                    </div>
                                </div>
                            )}

                            {experience?.location && (
                                <div className="exp-arc-info">
                                    <span className="exp-arc-info-icon">
                                        <MapPin size={16} />
                                    </span>
                                    <div>
                                        <strong>{archiveText.location}</strong>
                                        <p>{experience.location}</p>
                                    </div>
                                </div>
                            )}

                            {(dateRange || duration) && (
                                <div className="exp-arc-info">
                                    <span className="exp-arc-info-icon">
                                        <CalendarDays size={16} />
                                    </span>
                                    <div>
                                        <strong>{archiveText.period}</strong>
                                        <p>
                                            {[dateRange, duration]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {technologies.length > 0 && (
                                <div className="exp-arc-tech">
                                    <h5>{archiveText.technologies}</h5>

                                    <div className="exp-arc-tech-list">
                                        {technologies.map((technology, index) => (
                                            <span
                                                key={`${technology}-${index}`}
                                                className="exp-arc-tag"
                                            >
                                                {technology}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="exp-arc-modal-footer">
                        <button
                            type="button"
                            className="exp-arc-close"
                            onClick={closeDetail}
                        >
                            <X size={16} />
                            {archiveText.closeDetail}
                        </button>
                    </footer>
                </section>
            </div>
        );

        return createPortal(modal, document.body);
    };

    /* =========================================================
       LOADING STATE
    ========================================================= */

    if (loading) {
        return (
            <section
                id="experience"
                className="visitor-experience-section"
            >
                <div className="visitor-experience-loading">
                    <Loader2
                        size={28}
                        className="visitor-experience-loading-icon"
                    />
                    <span>{t.experience.loading}</span>
                </div>
            </section>
        );
    }

    /* =========================================================
       ERROR STATE
    ========================================================= */

    if (error) {
        return (
            <section
                id="experience"
                className="visitor-experience-section"
            >
                <div className="visitor-experience-container">
                    <div className="visitor-experience-error">
                        <p>{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    /* =========================================================
       MAIN RENDER
    ========================================================= */

    return (
        <>
            <section
                id="experience"
                className="visitor-experience-section"
            >
                <div className="visitor-experience-container">
                    {/* INTRO */}

                    <div className="visitor-experience-intro">
                        <p className="visitor-experience-eyebrow">
                            {t.experience.eyebrow}
                        </p>

                        <h2>{t.experience.title}</h2>

                        <p className="visitor-experience-intro-text">
                            {t.experience.intro}
                        </p>
                    </div>

                    {/* WORK EXPERIENCE */}

                    {workExperiences.length > 0 && (
                        <div className="visitor-experience-group">
                            <div className="visitor-experience-group-heading">
                                <div className="visitor-experience-group-icon">
                                    <BriefcaseBusiness size={20} />
                                </div>

                                <div>
                                    <p>{t.experience.workCategory}</p>
                                    <h3>{t.experience.workTab}</h3>
                                </div>
                            </div>

                            <div className="visitor-experience-list">
                                {workExperiences.map((experience, index) =>
                                    renderExperienceItem(experience, index)
                                )}
                            </div>
                        </div>
                    )}

                    {/* ORGANIZATION EXPERIENCE */}

                    {organizationExperiences.length > 0 && (
                        <div
                            className={[
                                'visitor-experience-group',
                                'visitor-experience-group--organization',
                            ].join(' ')}
                        >
                            <div className="visitor-experience-group-heading">
                                <div className="visitor-experience-group-icon">
                                    <Users size={20} />
                                </div>

                                <div>
                                    <p>{t.experience.orgCategory}</p>
                                    <h3>{t.experience.orgTab}</h3>
                                </div>
                            </div>

                            <div className="visitor-experience-list">
                                {organizationExperiences.map((experience, index) =>
                                    renderExperienceItem(experience, index)
                                )}
                            </div>
                        </div>
                    )}

                    {/* EMPTY STATE */}

                    {experiences.length === 0 && (
                        <div className="visitor-experience-empty">
                            <BriefcaseBusiness size={42} />

                            <h3>{t.experience.empty}</h3>

                            <p>{t.experience.emptyDesc}</p>
                        </div>
                    )}
                </div>
            </section>

            {renderArchiveModal()}
            {renderDetailModal()}
        </>
    );
}