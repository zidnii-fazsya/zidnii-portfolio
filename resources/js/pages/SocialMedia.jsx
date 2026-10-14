import React, { useEffect, useState } from 'react';
import {
    UserPlus,
    AlertCircle,
    X
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/social-media.css';

// SVG Brand Icons matching Image 3
const GitHubIcon = () => (
    <svg className="social-icon-img" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#181717" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 10C16.27 10 10 16.27 10 24C10 30.18 14.01 35.42 19.56 37.27C20.26 37.4 20.52 36.97 20.52 36.6C20.52 36.27 20.51 35.2 20.5 33.99C16.61 34.84 15.79 32.32 15.79 32.32C15.15 30.7 14.23 30.27 14.23 30.27C12.96 29.4 14.33 29.42 14.33 29.42C15.74 29.52 16.48 30.87 16.48 30.87C17.73 33.01 19.75 32.39 20.55 32.03C20.68 31.12 21.04 30.5 21.44 30.15C18.33 29.8 15.06 28.6 15.06 23.23C15.06 21.7 15.61 20.45 16.51 19.47C16.37 19.12 15.89 17.69 16.65 15.75C16.65 15.75 17.83 15.37 20.51 17.18C21.63 16.87 22.83 16.71 24.03 16.71C25.23 16.71 26.43 16.87 27.55 17.18C30.23 15.37 31.41 15.75 31.41 15.75C32.17 17.69 31.69 19.12 31.55 19.47C32.45 20.45 33 21.7 33 23.23C33 28.61 29.72 29.8 26.6 30.15C27.1 30.58 27.55 31.43 27.55 32.74C27.55 34.61 27.53 36.12 27.53 36.6C27.53 36.97 27.79 37.41 28.5 37.27C34.04 35.42 38.04 30.18 38.04 24C38.04 16.27 31.77 10 24 10Z"
            fill="white"
        />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="social-icon-img" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#0A66C2" />
        <path
            d="M17.8 15.5C17.8 16.9 16.7 18 15.3 18C13.9 18 12.8 16.9 12.8 15.5C12.8 14.1 13.9 13 15.3 13C16.7 13 17.8 14.1 17.8 15.5ZM13.2 34H17.4V20H13.2V34ZM28.6 19.6C26.3 19.6 24.8 20.8 24.2 21.8H24.1V20H20.1V34H24.3V26.8C24.3 24.9 25.1 23.1 27.2 23.1C29.3 23.1 29.4 25.1 29.4 27V34H33.6V26.2C33.6 21.8 32.6 19.6 28.6 19.6Z"
            fill="white"
        />
    </svg>
);

const InstagramIcon = () => (
    <svg className="social-icon-img" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="url(#ig-grad)" />
        <path
            d="M24 15C19.03 15 15 19.03 15 24C15 28.97 19.03 33 24 33C28.97 33 33 28.97 33 24C33 19.03 28.97 15 24 15ZM24 29.7C20.85 29.7 18.3 27.15 18.3 24C18.3 20.85 20.85 18.3 24 18.3C27.15 18.3 29.7 20.85 29.7 24C29.7 27.15 27.15 29.7 24 29.7ZM31.1 18.1C31.1 18.76 30.56 19.3 29.9 19.3C29.24 19.3 28.7 18.76 28.7 18.1C28.7 17.44 29.24 16.9 29.9 16.9C30.56 16.9 31.1 17.44 31.1 18.1ZM34.7 20.4C34.6 18.1 34 16.1 32.4 14.5C30.8 12.9 28.8 12.3 26.5 12.2C24.1 12.1 16.9 12.1 14.5 12.2C12.2 12.3 10.2 12.9 8.6 14.5C7 16.1 6.4 18.1 6.3 20.4C6.2 22.8 6.2 30 6.3 32.4C6.4 34.7 7 36.7 8.6 38.3C10.2 39.9 12.2 40.5 14.5 40.6C16.9 40.7 24.1 40.7 26.5 40.6C28.8 40.5 30.8 39.9 32.4 38.3C34 36.7 34.6 34.7 34.7 32.4C34.8 30 34.8 22.8 34.7 20.4Z"
            fill="white"
        />
        <defs>
            <linearGradient id="ig-grad" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEE440" />
                <stop offset="0.3" stopColor="#F15BB5" />
                <stop offset="0.6" stopColor="#9B5DE5" />
                <stop offset="1" stopColor="#00F5D4" />
            </linearGradient>
        </defs>
    </svg>
);

const WhatsAppIcon = () => (
    <svg className="social-icon-img" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#25D366" />
        <path
            d="M33.2 14.7C30.7 12.2 27.4 10.8 23.9 10.8C16.7 10.8 10.8 16.7 10.8 23.9C10.8 26.2 11.4 28.5 12.6 30.5L10.8 37.2L17.7 35.4C19.6 36.4 21.7 37 23.9 37C31.1 37 37 31.1 37 23.9C37 20.4 35.6 17.1 33.2 14.7ZM23.9 34.8C22 34.8 20.1 34.3 18.5 33.3L18.1 33.1L14 34.2L15.1 30.2L14.8 29.7C13.7 27.9 13.1 25.9 13.1 23.9C13.1 17.9 17.9 13.1 23.9 13.1C26.8 13.1 29.5 14.2 31.5 16.2C33.5 18.2 34.7 21 34.7 23.9C34.7 29.9 29.9 34.8 23.9 34.8ZM29.8 26.6C29.5 26.5 28 25.7 27.7 25.6C27.4 25.5 27.2 25.5 27 25.8C26.8 26.1 26.2 26.8 26 27C25.8 27.2 25.6 27.2 25.3 27.1C25 27 24 26.7 22.8 25.6C21.9 24.8 21.2 23.8 21.1 23.5C20.9 23.2 21.1 23.1 21.2 23C21.3 22.9 21.5 22.7 21.6 22.5C21.7 22.3 21.8 22.2 21.8 22C21.9 21.8 21.8 21.6 21.8 21.5C21.7 21.4 21.1 19.9 20.8 19.3C20.6 18.7 20.3 18.8 20.1 18.8C20 18.8 19.8 18.8 19.6 18.8C19.4 18.8 19.1 18.9 18.8 19.2C18.6 19.5 18 20.1 18 21.3C18 22.5 18.9 23.7 19 23.8C19.1 23.9 20.8 26.5 23.3 27.6C23.9 27.8 24.4 28 24.8 28.1C25.4 28.3 26 28.3 26.5 28.2C27.1 28.1 28.3 27.4 28.5 26.8C28.8 26.2 28.8 25.7 28.7 25.6C28.6 25.7 28.4 25.7 28.1 25.6H29.8Z"
            fill="white"
        />
    </svg>
);

export default function SocialMedia() {
    const [socialList, setSocialList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchSocialMedia = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/social-media', {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data social media.');
            }

            const data = await response.json();
            setSocialList(data.social_media || []);
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat mengambil data social media.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocialMedia();
    }, []);

    const handleUrlChange = (id, newUrl) => {
        setSocialList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, url: newUrl } : item))
        );
    };

    const handleToggleChange = (id) => {
        setSocialList((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, is_active: !item.is_active } : item
            )
        );
    };

    const handleCancel = () => {
        fetchSocialMedia();
        setMessage('');
        setError('');
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const payload = {
                social_media: socialList.map((item) => ({
                    id: item.id,
                    url: item.url || '',
                    is_active: item.is_active !== false,
                })),
            };

            const response = await fetch('/api/social-media', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal menyimpan perubahan social media.');
            }

            setMessage(result.message || 'Social media berhasil diperbarui.');
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat menyimpan social media.');
        } finally {
            setSaving(false);
        }
    };

    const getIconComponent = (slug) => {
        switch (slug?.toLowerCase()) {
            case 'github':
                return <GitHubIcon />;
            case 'linkedin':
                return <LinkedInIcon />;
            case 'instagram':
                return <InstagramIcon />;
            case 'whatsapp':
                return <WhatsAppIcon />;
            default:
                return <GitHubIcon />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Navbar title="Social Media" icon={UserPlus} />

                <main className="social-page">
                    {/* Header */}
                    <div className="social-page-header">
                        <h1>Social Media Links</h1>
                        <p>Kelola link akun sosial media anda disini!!!</p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="project-alert project-alert-error mb-4">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                            <button type="button" onClick={() => setError('')}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {message && (
                        <div className="project-alert project-alert-success mb-4">
                            <span>{message}</span>
                            <button type="button" onClick={() => setMessage('')}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Card Container */}
                    <div className="social-card">
                        {loading ? (
                            <div className="project-loading">
                                <div className="project-spinner"></div>
                                <span>Memuat data social media...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveChanges}>
                                <div className="social-rows-list">
                                    {socialList.map((item) => (
                                        <div key={item.id} className="social-row-item">
                                            {/* Icon */}
                                            <div className="social-icon-wrapper">
                                                {getIconComponent(item.slug)}
                                            </div>

                                            {/* Input URL */}
                                            <div className="social-input-wrapper">
                                                <input
                                                    type="text"
                                                    className="social-input"
                                                    placeholder="Enter your link here"
                                                    value={item.url || ''}
                                                    onChange={(e) =>
                                                        handleUrlChange(item.id, e.target.value)
                                                    }
                                                />
                                            </div>

                                            {/* Maroon Toggle Switch (Image 3) */}
                                            <label className="social-toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_active !== false}
                                                    onChange={() => handleToggleChange(item.id)}
                                                />
                                                <span className="social-toggle-slider"></span>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Form Actions */}
                                <div className="social-actions">
                                    <button
                                        type="button"
                                        className="social-cancel-btn"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="social-save-btn"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}