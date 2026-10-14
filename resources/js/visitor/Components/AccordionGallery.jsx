import React, { useEffect, useState } from 'react';

import {
    Image as ImageIcon,
    ExternalLink,
    FolderOpen,
    X,
    ArrowUpRight,
    Images,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| ACCORDION GALLERY (KARTU ARSIP)
|--------------------------------------------------------------------------
| Modal arsip HANYA menampilkan dokumentasi (gambar).
| Deskripsi, role, periode, teknologi, dan link proyek tidak lagi tampil
| di sini. Semua itu dipindahkan ke tombol "Baca Detail" pada halaman.
|
| Prop `projectDetails` tetap diterima agar pemanggil lama tidak error,
| tetapi hanya `labels` dan `projectPhotos` yang dipakai.
*/

export default function AccordionGallery({
    items = [],
    title = 'Project Archive',
    description = 'Explore project documentation, details, and technologies.',
    buttonText = 'Explore Archive',
    projectDetails = {},
    height = 220,
    gap = 12,
    radius = 15,
    accentColor = '#7B293D',
    overlayColor = '#120D0F',
    textColor = '#FFFFFF',
    showCount = true,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const details = projectDetails || {};

    const images = Array.isArray(items)
        ? items.filter(
              (item) =>
                  item &&
                  typeof item.image === 'string' &&
                  item.image.trim() !== ''
          )
        : [];

    const labels = {
        close: 'Close Archive',
        photos: 'Project Documentation',
        noPhotos: 'No documentation images available yet.',
        openImage: 'Open image',
        documentation: 'PROJECT DOCUMENTATION',
        ...(details.labels || {}),
    };

    const themeStyle = {
        '--archive-accent': accentColor,
        '--archive-overlay': overlayColor,
        '--archive-text': textColor,
        '--archive-radius': `${radius}px`,
        '--archive-gap': `${gap}px`,
        '--archive-image-height': `${height}px`,
    };

    // Close modal using Escape and prevent background scrolling.
    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const openArchive = () => setIsOpen(true);
    const closeArchive = () => setIsOpen(false);

    return (
        <>
            {/* COMPACT ARCHIVE CARD */}
            <section
                className="visitor-projects-archive visitor-projects-archive-card"
                style={themeStyle}
            >
                <button
                    type="button"
                    className="visitor-projects-archive-card-button"
                    onClick={openArchive}
                    aria-haspopup="dialog"
                    aria-label={`Open archive for ${title}`}
                >
                    <div className="visitor-projects-archive-preview">
                        {images.length > 0 ? (
                            images.slice(0, 3).map((item, index) => (
                                <div
                                    className={[
                                        'visitor-projects-archive-preview-item',
                                        `visitor-projects-archive-preview-item--${index + 1}`,
                                    ].join(' ')}
                                    key={item.id ?? `${item.image}-${index}`}
                                >
                                    <img
                                        src={item.image}
                                        alt={
                                            item.alt ||
                                            item.label ||
                                            `${title} preview ${index + 1}`
                                        }
                                        loading="lazy"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="visitor-projects-archive-preview-empty">
                                <Images size={34} aria-hidden="true" />
                                <span>No preview available</span>
                            </div>
                        )}

                        <div className="visitor-projects-archive-preview-shade" />

                        <span className="visitor-projects-archive-preview-label">
                            <FolderOpen size={14} aria-hidden="true" />
                            PROJECT ARCHIVE
                        </span>

                        {showCount && (
                            <span className="visitor-projects-archive-preview-count">
                                <ImageIcon size={14} aria-hidden="true" />
                                {images.length}{' '}
                                {images.length === 1 ? 'image' : 'images'}
                            </span>
                        )}

                        <span className="visitor-projects-archive-preview-open">
                            <ArrowUpRight size={21} aria-hidden="true" />
                        </span>
                    </div>

                    <div className="visitor-projects-archive-card-info">
                        <div className="visitor-projects-archive-card-heading">
                            <div className="visitor-projects-archive-card-title-wrap">
                                <span className="visitor-projects-archive-kicker">
                                    DOCUMENTATION ARCHIVE
                                </span>

                                <h4>{title}</h4>
                            </div>

                            <span
                                className="visitor-projects-archive-card-icon"
                                aria-hidden="true"
                            >
                                <ArrowUpRight size={19} />
                            </span>
                        </div>

                        {description && (
                            <p className="visitor-projects-archive-card-description">
                                {description}
                            </p>
                        )}

                        <span className="visitor-projects-archive-card-action">
                            <span>{buttonText}</span>
                            <ArrowUpRight size={15} aria-hidden="true" />
                        </span>
                    </div>
                </button>
            </section>

            {/* ARCHIVE MODAL (DOKUMENTASI SAJA) */}
            {isOpen && (
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
                        aria-labelledby="visitor-archive-modal-title"
                        style={themeStyle}
                    >
                        {/* MODAL HEADER */}
                        <header className="visitor-projects-archive-modal-header">
                            <div className="visitor-projects-archive-modal-heading">
                                <span className="visitor-projects-archive-modal-icon">
                                    <FolderOpen size={21} aria-hidden="true" />
                                </span>

                                <div>
                                    <span className="visitor-projects-archive-kicker">
                                        PROJECT COLLECTION
                                    </span>

                                    <h3 id="visitor-archive-modal-title">
                                        {title}
                                    </h3>

                                    <p>Browse the documentation images below.</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="visitor-projects-archive-modal-close"
                                onClick={closeArchive}
                                aria-label={labels.close}
                                title={labels.close}
                            >
                                <X size={21} aria-hidden="true" />
                            </button>
                        </header>

                        {/* MODAL BODY */}
                        <div className="visitor-projects-archive-modal-body">
                            <div className="visitor-projects-archive-gallery">
                                <div className="visitor-projects-archive-gallery-heading">
                                    <div className="visitor-projects-archive-section-heading">
                                        <span className="visitor-projects-archive-section-icon">
                                            <ImageIcon
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <div>
                                            <span className="visitor-projects-archive-kicker">
                                                {labels.documentation}
                                            </span>

                                            <h4>
                                                {details.projectPhotos ||
                                                    labels.photos}
                                            </h4>
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
                                                className="visitor-projects-archive-image-card"
                                                key={
                                                    item.id ??
                                                    `${item.image}-${index}`
                                                }
                                            >
                                                <a
                                                    href={item.image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="visitor-projects-archive-image-link"
                                                    aria-label={`${labels.openImage}: ${
                                                        item.label ||
                                                        `Image ${index + 1}`
                                                    }`}
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={
                                                            item.alt ||
                                                            item.label ||
                                                            `${title} documentation ${index + 1}`
                                                        }
                                                        loading="lazy"
                                                    />

                                                    <span className="visitor-projects-archive-image-overlay">
                                                        <ExternalLink
                                                            size={17}
                                                            aria-hidden="true"
                                                        />
                                                        {labels.openImage}
                                                    </span>
                                                </a>

                                                <figcaption>
                                                    <span className="visitor-projects-archive-image-number">
                                                        {String(
                                                            index + 1
                                                        ).padStart(2, '0')}
                                                    </span>

                                                    <span className="visitor-projects-archive-image-caption">
                                                        {item.label ||
                                                            `Documentation ${index + 1}`}
                                                    </span>
                                                </figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="visitor-projects-archive-no-images">
                                        <ImageIcon size={30} aria-hidden="true" />
                                        <p>{labels.noPhotos}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <footer className="visitor-projects-archive-modal-footer">
                            <span className="visitor-projects-archive-modal-total">
                                <Images size={16} aria-hidden="true" />
                                {images.length} documentation{' '}
                                {images.length === 1 ? 'image' : 'images'}
                            </span>

                            <button
                                type="button"
                                className="visitor-projects-archive-close"
                                onClick={closeArchive}
                            >
                                <X size={16} aria-hidden="true" />
                                {labels.close}
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
}