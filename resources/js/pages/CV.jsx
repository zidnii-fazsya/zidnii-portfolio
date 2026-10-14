
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    FileText,
    Upload,
    Download,
    FileUp,
    CheckCircle,
    AlertCircle,
    X,
    Eye,
} from 'lucide-react';

import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';

import '../../css/cv.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function getCsrfToken() {
    return document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
}

async function readResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();

    throw new Error(
        response.status === 419
            ? 'Sesi telah berakhir. Silakan muat ulang halaman dan coba kembali.'
            : `Server memberikan respons yang tidak sesuai (HTTP ${response.status}).`
    );
}

function CV() {
    const [cv, setCv] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | GET CV
    |--------------------------------------------------------------------------
    */

    const fetchCv = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/cv', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Gagal mengambil data CV.'
                );
            }

            setCv(data.cv || null);
        } catch (err) {
            console.error('Gagal mengambil data CV:', err);

            setError(
                err.message || 'Gagal mengambil data CV.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCv();
    }, [fetchCv]);

    /*
    |--------------------------------------------------------------------------
    | FILE VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateFile = (file) => {
        if (!file) {
            setError('Silakan pilih file CV terlebih dahulu.');
            return false;
        }

        const fileName = file.name.toLowerCase();

        const hasValidExtension = ALLOWED_EXTENSIONS.some(
            (extension) => fileName.endsWith(extension)
        );

        if (!hasValidExtension) {
            setError('Format file harus PDF, DOC, atau DOCX.');
            return false;
        }

        if (file.size === 0) {
            setError('File yang dipilih kosong. Silakan pilih file lain.');
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('Ukuran file maksimal 10 MB.');
            return false;
        }

        setError('');
        return true;
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT FILE
    |--------------------------------------------------------------------------
    */

    const handleFileSelect = (file) => {
        if (!validateFile(file)) {
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        setSelectedFile(file);
        setMessage('');
        setError('');
    };

    const handleFileInput = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            handleFileSelect(file);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DRAG AND DROP
    |--------------------------------------------------------------------------
    */

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Hindari menghilangkan status drag ketika kursor
        // masih berada di dalam elemen dropzone.
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragActive(false);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
        setDragActive(true);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);

        const file = event.dataTransfer.files?.[0];

        if (file) {
            handleFileSelect(file);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | UPLOAD CV
    |--------------------------------------------------------------------------
    */

    const handleUpload = async () => {
        if (uploading) {
            return;
        }

        if (!selectedFile) {
            setError('Silakan pilih file CV terlebih dahulu.');
            return;
        }

        if (!validateFile(selectedFile)) {
            return;
        }

        try {
            setUploading(true);
            setError('');
            setMessage('');

            const formData = new FormData();
            formData.append('cv', selectedFile);

            const headers = {
                Accept: 'application/json',
            };

            const csrfToken = getCsrfToken();

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/api/cv', {
                method: 'POST',
                headers,
                body: formData,
                credentials: 'same-origin',
            });

            const data = await readResponse(response);

            if (!response.ok) {
                const validationMessage = Object.values(
                    data.errors || {}
                ).flat()[0];

                throw new Error(
                    validationMessage ||
                    data.message ||
                    'CV gagal diupload.'
                );
            }

            setCv(data.cv || null);
            setSelectedFile(null);

            setMessage(
                data.message || 'CV berhasil diupload.'
            );

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Upload CV gagal:', err);

            setError(
                err.message || 'Terjadi kesalahan saat mengupload CV.'
            );
        } finally {
            setUploading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE SELECTED FILE
    |--------------------------------------------------------------------------
    */

    const handleRemoveSelectedFile = () => {
        setSelectedFile(null);
        setError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="cv-page">
            <Sidebar />

            <div className="cv-main">
                <Navbar
                    title="CV"
                    icon={FileText}
                />

                <main className="cv-content">
                    {/* PAGE HEADER */}
                    <section className="cv-page-header">
                        <div>
                            <h1>Curriculum Vitae</h1>
                            <p>
                                Upload CV yang ingin dilihat oleh pengunjung.
                            </p>
                        </div>
                    </section>

                    {/* SUCCESS MESSAGE */}
                    {message && (
                        <div
                            className="cv-alert cv-alert-success"
                            role="status"
                        >
                            <CheckCircle
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span>{message}</span>

                            <button
                                type="button"
                                aria-label="Tutup pesan"
                                onClick={() => setMessage('')}
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div
                            className="cv-alert cv-alert-error"
                            role="alert"
                        >
                            <AlertCircle
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span>{error}</span>

                            <button
                                type="button"
                                aria-label="Tutup pesan error"
                                onClick={() => setError('')}
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* CURRENT CV */}
                    <section className="cv-section">
                        <div className="cv-section-header">
                            <div>
                                <h2>CV Saat Ini</h2>
                                <p>
                                    CV yang saat ini tersedia untuk pengunjung.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="cv-loading">
                                Memuat data CV...
                            </div>
                        ) : cv ? (
                            <div className="current-cv-card">
                                <div className="current-cv-left">
                                    <div className="current-cv-icon">
                                        <FileText
                                            size={26}
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <div className="current-cv-info">
                                        <h3>{cv.file_name}</h3>

                                        <div className="current-cv-meta">
                                            <span>
                                                {cv.file_size_formatted || '-'}
                                            </span>

                                            <span>•</span>

                                            <span>
                                                {cv.created_at || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="cv-card-actions">
                                    {cv.preview_url && (
                                        <a
                                            href={cv.preview_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-button"
                                        >
                                            <Eye
                                                size={17}
                                                strokeWidth={1.8}
                                            />

                                            <span>Lihat CV</span>
                                        </a>
                                    )}

                                    {cv.download_url && (
                                        <a
                                            href={cv.download_url}
                                            className="download-button"
                                        >
                                            <Download
                                                size={17}
                                                strokeWidth={1.8}
                                            />

                                            <span>Download</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="cv-empty">
                                <div className="cv-empty-icon">
                                    <FileText
                                        size={28}
                                        strokeWidth={1.6}
                                    />
                                </div>

                                <h3>Belum Ada CV</h3>

                                <p>
                                    Silakan upload CV terlebih dahulu agar
                                    dapat dilihat oleh pengunjung.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* UPLOAD NEW CV */}
                    <section className="cv-section upload-section">
                        <div className="cv-section-header">
                            <div>
                                <h2>Upload CV Baru</h2>
                                <p>
                                    Upload CV terbaru untuk menggantikan
                                    CV sebelumnya.
                                </p>
                            </div>
                        </div>

                        {/* DROPZONE */}
                        <div
                            className={[
                                'cv-dropzone',
                                dragActive ? 'drag-active' : '',
                                selectedFile ? 'has-file' : '',
                            ].filter(Boolean).join(' ')}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(event) => {
                                if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                ) {
                                    event.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label="Pilih atau jatuhkan file CV"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileInput}
                                hidden
                            />

                            {selectedFile ? (
                                <div
                                    className="selected-file"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <div className="selected-file-icon">
                                        <FileText
                                            size={28}
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <div className="selected-file-info">
                                        <h3>{selectedFile.name}</h3>

                                        <p>
                                            {(
                                                selectedFile.size /
                                                (1024 * 1024)
                                            ).toFixed(2)} MB
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="remove-file-button"
                                        aria-label="Hapus file yang dipilih"
                                        onClick={handleRemoveSelectedFile}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="upload-icon">
                                        <FileUp
                                            size={32}
                                            strokeWidth={1.6}
                                        />
                                    </div>

                                    <h3>
                                        Drag &amp; Drop your file here
                                    </h3>

                                    <p>
                                        atau klik area ini untuk memilih file
                                    </p>

                                    <span className="file-format">
                                        PDF, DOC, atau DOCX • Maksimal 10 MB
                                    </span>
                                </>
                            )}
                        </div>

                        {/* UPLOAD BUTTON */}
                        <div className="upload-actions">
                            <button
                                type="button"
                                className="upload-button"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                            >
                                <Upload
                                    size={18}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </span>
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default CV;
