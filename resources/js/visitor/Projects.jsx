
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
    FolderKanban,
    FolderOpen,
    CalendarDays,
    Code2,
    ExternalLink,
    Image as ImageIcon,
    Loader2,
    X,
    Star,
    RefreshCw,
    ArrowUpRight,
    Images,
    Layers,
} from 'lucide-react';

import '../../css/visitor-projects.css';
import useLanguage from '../utils/useLanguage';

/*
|--------------------------------------------------------------------------
| KONFIGURASI URL GAMBAR
|--------------------------------------------------------------------------
|
| File gambar yang sudah disalin ke Netlify tersedia melalui:
| /storage/...
|
| Jika menggunakan domain Netlify sendiri, biarkan kosong.
| Jika ingin menggunakan domain khusus untuk file statis, isi di sini.
|
*/

const STATIC_STORAGE_BASE_URL = '';

/*
|--------------------------------------------------------------------------
| NORMALISASI URL GAMBAR
|--------------------------------------------------------------------------
*/

const normalizeImageUrl = (rawValue) => {
    if (typeof rawValue !== 'string' || !rawValue.trim()) {
        return '';
    }

    const value = rawValue.trim();

    // Pertahankan URL data dan blob.
    if (/^(data:|blob:)/i.test(value)) {
        return value;
    }

    // Jika URL absolut, periksa apakah berasal dari Laravel storage.
    if (/^https?:\/\//i.test(value)) {
        try {
            const parsedUrl = new URL(value);

            if (
                parsedUrl.pathname === '/storage' ||
                parsedUrl.pathname.startsWith('/storage/')
            ) {
                return `${STATIC_STORAGE_BASE_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
            }

            return value;
        } catch {
            return value;
        }
    }

    // Bersihkan format path.
    const cleanPath = value
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');

    if (!cleanPath) return '';

    // Path storage sudah benar.
    if (cleanPath === 'storage') {
        return `${STATIC_STORAGE_BASE_URL}/storage`;
    }

    if (cleanPath.startsWith('storage/')) {
        return `${STATIC_STORAGE_BASE_URL}/${cleanPath}`;
    }

    // Hilangkan prefix public/ jika API mengirimkannya.
    if (cleanPath.startsWith('public/storage/')) {
        return `${STATIC_STORAGE_BASE_URL}/${cleanPath.replace('public/', '')}`;
    }

    // Path relatif lainnya dianggap berada di dalam storage.
    return `${STATIC_STORAGE_BASE_URL}/storage/${cleanPath}`;
};

/*
|--------------------------------------------------------------------------
| MENGAMBIL PATH GAMBAR
|--------------------------------------------------------------------------
*/

const getRawImagePath = (item) => {
    if (typeof item === 'string') return item;

    if (item && typeof item === 'object') {
        return (
            item.image ||
            item.src ||
            item.url ||
            item.path ||
            item.image_url ||
            item.file_path ||
            item.file ||
            ''
        );
    }

    return '';
};

/*
|--------------------------------------------------------------------------
| NORMALISASI TECHNOLOGIES
|--------------------------------------------------------------------------
*/

const normalizeTechnologies = (technologies) => {
    if (Array.isArray(technologies)) {
        return technologies
            .map((item) => String(item ?? '').trim())
            .filter(Boolean);
    }

    if (typeof technologies !== 'string') return [];

    const value = technologies.trim();

    if (!value) return [];

    try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => String(item ?? '').trim())
                .filter(Boolean);
        }
    } catch {
        // Data dapat berupa teks biasa.
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

/*
|--------------------------------------------------------------------------
| NAMA FILE GAMBAR ASLI
|--------------------------------------------------------------------------
*/

const getFileNameFromPath = (rawPath) => {
    if (typeof rawPath !== 'string') return '';

    const cleanPath = rawPath
        .split('#')[0]
        .split('?')[0]
        .replace(/\\/g, '/');

    const lastSegment =
        cleanPath.split('/').filter(Boolean).pop() || '';

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

/*
|--------------------------------------------------------------------------
| MENGGABUNGKAN GAMBAR PROYEK
|--------------------------------------------------------------------------
*/

const getProjectImages = (project) => {
    const combinedImages = [];
    const projectTitle = project?.title || 'Project';

    const thumbnail = getRawImagePath({
        image:
            project?.thumbnail_url ||
            project?.thumbnail ||
            project?.image_url ||
            project?.image ||
            '',
    });

    if (thumbnail) {
        combinedImages.push({
            image: thumbnail,
            alt: `${projectTitle} thumbnail`,
        });
    }

    // Dokumentasi dari berbagai kemungkinan field API.
    const imageCollections = [
        project?.image_urls,
        project?.images,
        project?.documentations,
        project?.documentation,
        project?.project_images,
        project?.photos,
    ];

    imageCollections.forEach((collection) => {
        if (Array.isArray(collection)) {
            combinedImages.push(...collection);
        }
    });

    const seenUrls = new Set();
    const result = [];

    combinedImages.forEach((item, index) => {
        const rawPath = getRawImagePath(item);
        const image = normalizeImageUrl(rawPath);

        if (!image) return;

        const duplicateKey = image.toLowerCase();

        if (seenUrls.has(duplicateKey)) return;

        seenUrls.add(duplicateKey);

        const isObject =
            typeof item === 'object' && item !== null;

        const position = result.length + 1;

        const fileName =
            (isObject &&
                firstFilled(
                    item.original_name,
                    item.original_filename,
                    item.file_name,
                    item.filename,
                    item.name
                )) ||
            getFileNameFromPath(rawPath) ||
            `${projectTitle} ${position}`;

        result.push({
            id:
                (isObject && item.id) ??
                `${project?.id ?? 'project'}-image-${index}`,
            image,
            label: fileName,
            alt:
                (isObject &&
                    firstFilled(
                        item.alt,
                        item.caption,
                        item.title
                    )) ||
                fileName,
        });
    });

    return result;
};

/*
|--------------------------------------------------------------------------
| INFORMASI PERIODE PROYEK
|--------------------------------------------------------------------------
*/

const getDateOnly = (date) => {
    if (!date) return '';

    const value = String(date).trim();

    return value.length >= 10 ? value.slice(0, 10) : '';
};

const formatMonthYear = (date, isEnglish) => {
    const dateOnly = getDateOnly(date);

    if (!dateOnly) return '';

    const [year, month] = dateOnly.split('-').map(Number);

    if (!year || !month || month < 1 || month > 12) {
        return '';
    }

    return new Date(year, month - 1, 1).toLocaleDateString(
        isEnglish ? 'en-US' : 'id-ID',
        {
            month: 'short',
            year: 'numeric',
        }
    );
};

const getProjectPeriod = (project, isEnglish) => {
    const start = formatMonthYear(
        project?.start_date,
        isEnglish
    );

    const end = formatMonthYear(
        project?.end_date,
        isEnglish
    );

    if (start && end) return `${start} – ${end}`;

    return start || end || '';
};

const getProjectYear = (project) => {
    if (project?.create_year) {
        return String(project.create_year);
    }

    if (project?.start_date) {
        return String(project.start_date).slice(0, 4);
    }

    if (project?.end_date) {
        return String(project.end_date).slice(0, 4);
    }

    return '';
};

const isFeatured = (project) => {
    const value = project?.is_featured;

    return (
        value === true ||
        value === 1 ||
        value === '1' ||
        value === 'true'
    );
};

const formatCount = (count) =>
    new Intl.NumberFormat('en-US').format(count);

/*
|--------------------------------------------------------------------------
| PROJECTS COMPONENT
|--------------------------------------------------------------------------
*/

export default function Projects() {
    const languageContext = useLanguage();
    const language = languageContext?.language || 'id';
    const isEnglish = language === 'en';

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    const [selectedProject, setSelectedProject] = useState(null);
    const [detailProject, setDetailProject] = useState(null);

    const text = {
        eyebrow: isEnglish ? 'MY SELECTED WORK' : 'KARYA PILIHAN SAYA',
        title: isEnglish ? 'Projects' : 'Proyek',
        intro: isEnglish
            ? 'A collection of projects I have worked on, from web development to digital solutions.'
            : 'Kumpulan proyek yang pernah saya kerjakan, mulai dari pengembangan web hingga solusi digital.',

        featured: isEnglish ? 'Featured Project' : 'Proyek Unggulan',
        project: isEnglish ? 'PROJECT' : 'PROYEK',
        role: isEnglish ? 'My Role' : 'Peran Saya',
        technology: isEnglish ? 'Technologies & Skills' : 'Teknologi & Keahlian',
        projectPeriod: isEnglish ? 'Project Period' : 'Periode Proyek',
        year: isEnglish ? 'Year' : 'Tahun',

        cardLabel: isEnglish ? 'PROJECT ARCHIVE' : 'ARSIP PROYEK',
        cardKicker: isEnglish ? 'DOCUMENTATION ARCHIVE' : 'ARSIP DOKUMENTASI',
        cardSuffix: isEnglish ? 'Archive' : 'Arsip',
        cardDescription: isEnglish
            ? 'Explore the screenshots, thumbnails, and documentation from this project.'
            : 'Jelajahi thumbnail, tangkapan layar, dan dokumentasi proyek ini.',
        cardAction: isEnglish ? 'View Project Details' : 'Lihat Detail Proyek',
        imageCount: isEnglish ? 'images' : 'gambar',
        noPhotos: isEnglish
            ? 'No project images available yet.'
            : 'Belum ada gambar untuk proyek ini.',

        modalEyebrow: isEnglish ? 'PROJECT COLLECTION' : 'KOLEKSI PROYEK',
        modalSubtitle: isEnglish
            ? 'Browse the documentation images below.'
            : 'Telusuri gambar dokumentasi proyek di bawah ini.',
        docKicker: isEnglish ? 'PROJECT DOCUMENTATION' : 'DOKUMENTASI PROYEK',
        docTitle: isEnglish ? 'Project Documentation' : 'Dokumentasi Proyek',
        totalImages: isEnglish ? 'documentation images' : 'gambar dokumentasi',
        closeArchive: isEnglish ? 'Close Archive' : 'Tutup Arsip',
        closeLabel: isEnglish ? 'Close dialog' : 'Tutup jendela',
        viewImage: isEnglish ? 'Open image in a new tab' : 'Buka gambar di tab baru',

        readDetail: isEnglish ? 'Read Details' : 'Baca Detail',
        detailEyebrow: isEnglish ? 'PROJECT DETAIL' : 'DETAIL PROYEK',
        detailSubtitle: isEnglish
            ? 'The complete description of this project.'
            : 'Deskripsi lengkap dari proyek ini.',
        overviewKicker: isEnglish ? 'FULL DESCRIPTION' : 'DESKRIPSI LENGKAP',
        description: isEnglish ? 'Project Description' : 'Deskripsi Proyek',
        noDescription: isEnglish
            ? 'No project description has been added yet.'
            : 'Belum ada deskripsi proyek.',
        closeDetail: isEnglish ? 'Close' : 'Tutup',
        projectLink: isEnglish ? 'Visit Project' : 'Kunjungi Proyek',
        githubLink: isEnglish ? 'View Repository' : 'Lihat Repository',

        loading: isEnglish ? 'Loading projects...' : 'Memuat proyek...',
        empty: isEnglish ? 'No projects yet' : 'Belum Ada Proyek',
        emptyDescription: isEnglish
            ? 'Project information will appear here once it has been added.'
            : 'Informasi proyek akan ditampilkan di sini setelah ditambahkan.',
        loadError: isEnglish
            ? 'Failed to load project data.'
            : 'Gagal mengambil data proyek.',
        retry: isEnglish ? 'Try Again' : 'Coba Lagi',
    };

    /*
    |--------------------------------------------------------------------------
    | FETCH PROJECTS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const fetchProjects = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/projects', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const responseText = await response.text();

                    console.error(
                        'Projects API HTTP Error:',
                        response.status,
                        responseText
                    );

                    throw new Error(
                        `API Projects mengembalikan status ${response.status}.`
                    );
                }

                const data = await response.json();

                let projectData = [];

                if (Array.isArray(data)) {
                    projectData = data;
                } else if (Array.isArray(data?.projects)) {
                    projectData = data.projects;
                } else if (Array.isArray(data?.data)) {
                    projectData = data.data;
                }

                if (!controller.signal.aborted) {
                    console.log(
                        'Projects API Data:',
                        projectData
                    );

                    setProjects(projectData);
                }
            } catch (err) {
                if (err.name === 'AbortError') return;

                console.error('Projects API Error:', err);

                if (!controller.signal.aborted) {
                    setProjects([]);
                    setError(err?.message || text.loadError);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchProjects();

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadKey]);

    /*
    |--------------------------------------------------------------------------
    | LOCK SCROLL DAN ESCAPE
    |--------------------------------------------------------------------------
    */

    const isModalOpen = Boolean(
        selectedProject || detailProject
    );

    useEffect(() => {
        if (!isModalOpen) return undefined;

        const previousOverflow =
            document.body.style.overflow;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedProject(null);
                setDetailProject(null);
            }
        };

        document.body.style.overflow = 'hidden';

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [isModalOpen]);

    const openArchive = (project) =>
        setSelectedProject(project);

    const closeArchive = () =>
        setSelectedProject(null);

    const openDetail = (project) =>
        setDetailProject(project);

    const closeDetail = () =>
        setDetailProject(null);

    /*
    |--------------------------------------------------------------------------
    | TECHNOLOGY TAGS
    |--------------------------------------------------------------------------
    */

    const renderTechnologies = (technologies) => {
        const items = normalizeTechnologies(technologies);

        if (items.length === 0) return null;

        return (
            <div className="visitor-projects-technologies">
                <p className="visitor-projects-label">
                    {text.technology}
                </p>

                <div className="visitor-projects-tags">
                    {items.map((technology, index) => (
                        <span
                            key={`${technology}-${index}`}
                            className="visitor-projects-tag"
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | KARTU ARSIP
    |--------------------------------------------------------------------------
    */

    const renderArchiveCard = (project, images) => {
        const title = project?.title || 'Project';

        if (!images.length) {
            return (
                <div className="visitor-projects-archive-card">
                    <div className="visitor-projects-archive-preview visitor-projects-archive-preview--empty">
                        <div className="visitor-projects-archive-preview-empty">
                            <ImageIcon size={28} />
                            <span>{text.noPhotos}</span>
                        </div>
                    </div>

                    <div className="visitor-projects-archive-card-info">
                        <button
                            type="button"
                            className="visitor-projects-archive-card-button"
                            onClick={() => openArchive(project)}
                            aria-haspopup="dialog"
                        >
                            <div className="visitor-projects-archive-card-heading">
                                <div className="visitor-projects-archive-card-title-wrap">
                                    <span className="visitor-projects-archive-kicker">
                                        {text.cardKicker}
                                    </span>

                                    <h4>
                                        {`${title} ${text.cardSuffix}`}
                                    </h4>
                                </div>

                                <span className="visitor-projects-archive-card-icon">
                                    <ArrowUpRight size={17} />
                                </span>
                            </div>

                            <span className="visitor-projects-archive-card-action">
                                {text.cardAction}
                                <ArrowUpRight size={14} />
                            </span>
                        </button>
                    </div>
                </div>
            );
        }

        const previewImages = images.slice(0, 3);

        return (
            <div className="visitor-projects-archive-card">
                <button
                    type="button"
                    className="visitor-projects-archive-card-button"
                    onClick={() => openArchive(project)}
                    aria-label={`${text.cardAction}: ${title}`}
                    aria-haspopup="dialog"
                >
                    <div
                        className={`visitor-projects-archive-preview visitor-projects-archive-preview--${previewImages.length}`}
                    >
                        {previewImages.map((item, index) => (
                            <div
                                key={
                                    item.id != null
                                        ? String(item.id)
                                        : `preview-${index}`
                                }
                                className={`visitor-projects-archive-preview-item visitor-projects-archive-preview-item--${index + 1}`}
                            >
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading="lazy"
                                    onError={(event) => {
                                        console.error(
                                            'Project preview image failed:',
                                            item.image
                                        );

                                        event.currentTarget.style.visibility =
                                            'hidden';
                                    }}
                                />
                            </div>
                        ))}

                        <div className="visitor-projects-archive-preview-shade" />

                        <span className="visitor-projects-archive-preview-label">
                            <FolderOpen size={15} />
                            {text.cardLabel}
                        </span>

                        <span className="visitor-projects-archive-preview-open">
                            <ArrowUpRight size={18} />
                        </span>

                        <span className="visitor-projects-archive-preview-count">
                            <Images size={14} />
                            {formatCount(images.length)} {text.imageCount}
                        </span>
                    </div>

                    <div className="visitor-projects-archive-card-info">
                        <div className="visitor-projects-archive-card-heading">
                            <div className="visitor-projects-archive-card-title-wrap">
                                <span className="visitor-projects-archive-kicker">
                                    {text.cardKicker}
                                </span>

                                <h4>
                                    {`${title} ${text.cardSuffix}`}
                                </h4>
                            </div>

                            <span className="visitor-projects-archive-card-icon">
                                <ArrowUpRight size={17} />
                            </span>
                        </div>

                        <p className="visitor-projects-archive-card-description">
                            {text.cardDescription}
                        </p>

                        <span className="visitor-projects-archive-card-action">
                            {text.cardAction}
                            <ArrowUpRight size={14} />
                        </span>
                    </div>
                </button>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | ITEM PROYEK
    |--------------------------------------------------------------------------
    */

    const renderProjectItem = (project, index) => {
        const images = getProjectImages(project);
        const period = getProjectPeriod(
            project,
            isEnglish
        );

        const year = getProjectYear(project);
        const featured = isFeatured(project);
        const reversed = index % 2 === 1;

        const hasDescription = Boolean(
            project?.short_description ||
            project?.description
        );

        return (
            <article
                key={
                    project?.id ??
                    project?.slug ??
                    `project-${index}`
                }
                className={[
                    'visitor-projects-item',
                    reversed
                        ? 'visitor-projects-item--reverse'
                        : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div className="visitor-projects-content">
                    <div className="visitor-projects-number">
                        {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="visitor-projects-heading">
                        <div className="visitor-projects-icon">
                            <FolderKanban size={22} />
                        </div>

                        <div className="visitor-projects-heading-text">
                            <p className="visitor-projects-type">
                                {project?.category || text.project}
                            </p>

                            <h3>
                                {project?.title || 'Untitled Project'}
                            </h3>
                        </div>
                    </div>

                    {project?.subtitle && (
                        <p className="visitor-projects-subtitle">
                            {project.subtitle}
                        </p>
                    )}

                    {(project?.role ||
                        period ||
                        year ||
                        featured) && (
                        <div className="visitor-projects-meta">
                            {project?.role && (
                                <div className="visitor-projects-meta-item">
                                    <Code2 size={16} />

                                    <span>
                                        {text.role}: {project.role}
                                    </span>
                                </div>
                            )}

                            {period && (
                                <div className="visitor-projects-meta-item">
                                    <CalendarDays size={16} />
                                    <span>{period}</span>
                                </div>
                            )}

                            {!period && year && (
                                <div className="visitor-projects-meta-item">
                                    <CalendarDays size={16} />

                                    <span>
                                        {text.year} {year}
                                    </span>
                                </div>
                            )}

                            {featured && (
                                <span className="visitor-projects-featured">
                                    <Star size={13} />
                                    {text.featured}
                                </span>
                            )}
                        </div>
                    )}

                    {hasDescription && (
                        <div className="visitor-projects-description">
                            <p className="visitor-projects-description-text">
                                {project.short_description ||
                                    project.description}
                            </p>

                            <button
                                type="button"
                                className="visitor-projects-readmore"
                                onClick={() => openDetail(project)}
                                aria-haspopup="dialog"
                            >
                                {text.readDetail}
                                <ArrowUpRight size={14} />
                            </button>
                        </div>
                    )}

                    {renderTechnologies(
                        project?.technologies
                    )}

                    {(project?.project_url ||
                        project?.github_url) && (
                        <div className="visitor-projects-actions">
                            {project?.project_url && (
                                <a
                                    href={project.project_url}
                                    className="visitor-projects-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={text.projectLink}
                                    title={text.projectLink}
                                >
                                    <ExternalLink size={17} />
                                </a>
                            )}

                            {project?.github_url && (
                                <a
                                    href={project.github_url}
                                    className="visitor-projects-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={text.githubLink}
                                    title={text.githubLink}
                                >
                                    <Code2 size={17} />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="visitor-projects-gallery">
                    {renderArchiveCard(project, images)}
                </div>
            </article>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | MODAL ARSIP
    |--------------------------------------------------------------------------
    */

    const renderArchiveModal = () => {
        if (!selectedProject) return null;

        const project = selectedProject;
        const title = project.title || 'Untitled Project';
        const images = getProjectImages(project);

        const modal = (
            <div
                className="visitor-projects-archive-modal-backdrop"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        closeArchive();
                    }
                }}
            >
                <section
                    className="visitor-projects-archive-modal visitor-projects-archive-modal--wide"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${title} ${text.cardSuffix}`}
                >
                    <header className="visitor-projects-archive-modal-header">
                        <div className="visitor-projects-archive-modal-heading">
                            <span className="visitor-projects-archive-modal-icon">
                                <FolderOpen size={22} />
                            </span>

                            <div>
                                <span className="visitor-projects-archive-kicker">
                                    {text.modalEyebrow}
                                </span>

                                <h3>
                                    {`${title} ${text.cardSuffix}`}
                                </h3>

                                <p>{text.modalSubtitle}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="visitor-projects-archive-modal-close"
                            onClick={closeArchive}
                            aria-label={text.closeLabel}
                            title={text.closeLabel}
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <div className="visitor-projects-archive-modal-body">
                        <div className="visitor-projects-archive-gallery">
                            <div className="visitor-projects-archive-gallery-heading">
                                <div className="visitor-projects-archive-section-heading">
                                    <span className="visitor-projects-archive-section-icon">
                                        <ImageIcon size={19} />
                                    </span>

                                    <div>
                                        <span className="visitor-projects-archive-kicker">
                                            {text.docKicker}
                                        </span>

                                        <h4>{text.docTitle}</h4>
                                    </div>
                                </div>

                                <span className="visitor-projects-archive-gallery-count">
                                    {String(images.length).padStart(2, '0')}
                                </span>
                            </div>

                            {images.length > 0 ? (
                                <div className="visitor-projects-archive-image-grid">
                                    {images.map((item, index) => (
                                        <figure
                                            key={
                                                item.id != null
                                                    ? String(item.id)
                                                    : `image-${index}`
                                            }
                                            className="visitor-projects-archive-image-card"
                                        >
                                            <a
                                                href={item.image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="visitor-projects-archive-image-link"
                                                aria-label={`${text.viewImage}: ${item.label}`}
                                                title={text.viewImage}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.alt}
                                                    loading="lazy"
                                                    onError={() => {
                                                        console.error(
                                                            'Project documentation image failed:',
                                                            item.image
                                                        );
                                                    }}
                                                />

                                                <span className="visitor-projects-archive-image-overlay">
                                                    <ArrowUpRight size={16} />
                                                    {text.viewImage}
                                                </span>
                                            </a>

                                            <figcaption>
                                                <span className="visitor-projects-archive-image-number">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>

                                                <span className="visitor-projects-archive-image-caption">
                                                    {item.label}
                                                </span>
                                            </figcaption>
                                        </figure>
                                    ))}
                                </div>
                            ) : (
                                <div className="visitor-projects-archive-no-images">
                                    <ImageIcon size={34} />
                                    <p>{text.noPhotos}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="visitor-projects-archive-modal-footer">
                        <span className="visitor-projects-archive-modal-total">
                            <Images size={16} />
                            {formatCount(images.length)} {text.totalImages}
                        </span>

                        <button
                            type="button"
                            className="visitor-projects-archive-close"
                            onClick={closeArchive}
                        >
                            <X size={16} />
                            {text.closeArchive}
                        </button>
                    </footer>
                </section>
            </div>
        );

        return createPortal(modal, document.body);
    };

    /*
    |--------------------------------------------------------------------------
    | MODAL DETAIL
    |--------------------------------------------------------------------------
    */

    const renderDetailModal = () => {
        if (!detailProject) return null;

        const project = detailProject;
        const title = project.title || 'Untitled Project';

        const period = getProjectPeriod(
            project,
            isEnglish
        );

        const year = getProjectYear(project);

        const technologies = normalizeTechnologies(
            project.technologies
        );

        const modal = (
            <div
                className="visitor-projects-archive-modal-backdrop"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        closeDetail();
                    }
                }}
            >
                <section
                    className="visitor-projects-archive-modal visitor-projects-archive-modal--detail"
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                >
                    <header className="visitor-projects-archive-modal-header">
                        <div className="visitor-projects-archive-modal-heading">
                            <span className="visitor-projects-archive-modal-icon">
                                <FolderKanban size={22} />
                            </span>

                            <div>
                                <span className="visitor-projects-archive-kicker">
                                    {text.detailEyebrow}
                                </span>

                                <h3>{title}</h3>
                                <p>{text.detailSubtitle}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="visitor-projects-archive-modal-close"
                            onClick={closeDetail}
                            aria-label={text.closeLabel}
                            title={text.closeLabel}
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <div className="visitor-projects-archive-modal-body">
                        <div className="visitor-projects-archive-overview">
                            <div className="visitor-projects-archive-section-heading">
                                <span className="visitor-projects-archive-section-icon">
                                    <Layers size={19} />
                                </span>

                                <div>
                                    <span className="visitor-projects-archive-kicker">
                                        {text.overviewKicker}
                                    </span>

                                    <h4>{text.description}</h4>
                                </div>
                            </div>

                            {project.subtitle && (
                                <p className="visitor-projects-archive-subtitle">
                                    {project.subtitle}
                                </p>
                            )}

                            <p className="visitor-projects-archive-overview-description">
                                {project.description ||
                                    project.short_description ||
                                    text.noDescription}
                            </p>

                            {project.role && (
                                <div className="visitor-projects-archive-info">
                                    <span className="visitor-projects-archive-info-icon">
                                        <Code2 size={16} />
                                    </span>

                                    <div>
                                        <strong>{text.role}</strong>
                                        <p>{project.role}</p>
                                    </div>
                                </div>
                            )}

                            {(period || year) && (
                                <div className="visitor-projects-archive-info">
                                    <span className="visitor-projects-archive-info-icon">
                                        <CalendarDays size={16} />
                                    </span>

                                    <div>
                                        <strong>{text.projectPeriod}</strong>
                                        <p>
                                            {period ||
                                                `${text.year} ${year}`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {technologies.length > 0 && (
                                <div className="visitor-projects-archive-tech">
                                    <h5>{text.technology}</h5>

                                    <div className="visitor-projects-archive-tech-list">
                                        {technologies.map(
                                            (technology, index) => (
                                                <span
                                                    key={`${technology}-${index}`}
                                                    className="visitor-projects-tag"
                                                >
                                                    {technology}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {(project.project_url ||
                                project.github_url) && (
                                <div className="visitor-projects-archive-links">
                                    {project.project_url && (
                                        <a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="visitor-projects-link"
                                        >
                                            <ExternalLink size={16} />
                                            <span>{text.projectLink}</span>
                                        </a>
                                    )}

                                    {project.github_url && (
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="visitor-projects-link"
                                        >
                                            <Code2 size={16} />
                                            <span>{text.githubLink}</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="visitor-projects-archive-modal-footer">
                        <button
                            type="button"
                            className="visitor-projects-archive-close"
                            onClick={closeDetail}
                        >
                            <X size={16} />
                            {text.closeDetail}
                        </button>
                    </footer>
                </section>
            </div>
        );

        return createPortal(modal, document.body);
    };

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <section
                id="projects"
                className="visitor-projects-section"
                aria-busy="true"
            >
                <div className="visitor-projects-loading">
                    <Loader2
                        size={28}
                        className="visitor-projects-loading-icon"
                    />

                    <span>{text.loading}</span>
                </div>
            </section>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error) {
        return (
            <section
                id="projects"
                className="visitor-projects-section"
                aria-busy="false"
            >
                <div className="visitor-projects-container">
                    <div className="visitor-projects-intro">
                        <p className="visitor-projects-eyebrow">
                            {text.eyebrow}
                        </p>

                        <h2>{text.title}</h2>
                    </div>

                    <div
                        className="visitor-projects-error"
                        role="alert"
                    >
                        <FolderKanban size={28} />
                        <p>{error}</p>

                        <button
                            type="button"
                            className="visitor-projects-detail-button"
                            onClick={() =>
                                setReloadKey((key) => key + 1)
                            }
                        >
                            <RefreshCw size={16} />
                            {text.retry}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | HALAMAN UTAMA
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <section
                id="projects"
                className="visitor-projects-section"
                aria-busy="false"
            >
                <div className="visitor-projects-container">
                    <div className="visitor-projects-intro">
                        <p className="visitor-projects-eyebrow">
                            {text.eyebrow}
                        </p>

                        <h2>{text.title}</h2>

                        <p className="visitor-projects-intro-text">
                            {text.intro}
                        </p>
                    </div>

                    {projects.length > 0 ? (
                        <div className="visitor-projects-list">
                            {projects.map((project, index) =>
                                renderProjectItem(
                                    project,
                                    index
                                )
                            )}
                        </div>
                    ) : (
                        <div className="visitor-projects-empty">
                            <FolderKanban size={42} />
                            <h3>{text.empty}</h3>
                            <p>{text.emptyDescription}</p>
                        </div>
                    )}
                </div>
            </section>

            {renderArchiveModal()}
            {renderDetailModal()}
        </>
    );
}
