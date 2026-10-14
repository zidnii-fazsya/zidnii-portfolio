
import React, { useState, useEffect } from 'react';
import {
    FileUser,
    ChevronLeft,
    ChevronDown,
    Plus,
    X,
    ImageIcon,
    AlertCircle,
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/project.css';

const normalizeImageUrl = (value) => {
    if (!value || typeof value !== 'string') return '';

    const path = value.trim();
    if (!path) return '';

    // URL eksternal atau URL preview file lokal.
    if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
        return path;
    }

    // Rapikan path lokal.
    const cleanPath = path
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');

    if (cleanPath.startsWith('storage/')) {
        return `/${cleanPath}`;
    }

    return `/storage/${cleanPath}`;
};

const getImagePath = (item) => {
    if (typeof item === 'string') return item;

    if (item && typeof item === 'object') {
        return item.image || item.src || item.url || item.path || '';
    }

    return '';
};

const getErrorMessage = (result) => {
    if (result?.errors) {
        const firstError = Object.values(result.errors).flat()[0];
        if (firstError) return firstError;
    }

    return result?.message || 'Terjadi kesalahan. Silakan coba kembali.';
};

export default function AddProject({ editId = null }) {
    const isEdit = Boolean(editId);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: '',
        technologies: '',
        role: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const [docFiles, setDocFiles] = useState([]);
    const [docPreviews, setDocPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Memuat data proyek ketika halaman digunakan untuk edit.
    useEffect(() => {
        if (!isEdit || !editId) {
            setFetching(false);
            return;
        }

        let cancelled = false;

        const fetchProjectDetail = async () => {
            try {
                setFetching(true);
                setError('');

                const response = await fetch(`/api/projects/${editId}`, {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(getErrorMessage(result));
                }

                const project = result.project || result;

                if (cancelled) return;

                const technologies = Array.isArray(project.technologies)
                    ? project.technologies.join(', ')
                    : project.technologies || '';

                setFormData({
                    title: project.title || '',
                    subtitle: project.subtitle || '',
                    category: project.category || '',
                    technologies,
                    role: project.role || '',
                    start_date: project.start_date
                        ? String(project.start_date).slice(0, 10)
                        : '',
                    end_date: project.end_date
                        ? String(project.end_date).slice(0, 10)
                        : '',
                    description: project.description || '',
                });

                const thumbnail = project.thumbnail_url || project.thumbnail;

                if (thumbnail) {
                    setThumbnailPreview(normalizeImageUrl(thumbnail));
                }

                const imageList = Array.isArray(project.images)
                    ? project.images
                    : [];

                setExistingImages(
                    imageList
                        .map((item, index) => {
                            const path = getImagePath(item);

                            if (!path) return null;

                            return {
                                id: item?.id ?? `existing-${index}`,
                                path,
                                url: normalizeImageUrl(path),
                                caption:
                                    typeof item === 'object' && item !== null
                                        ? item.caption || item.title || ''
                                        : '',
                            };
                        })
                        .filter(Boolean)
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Gagal memuat data proyek.'
                    );
                }
            } finally {
                if (!cancelled) setFetching(false);
            }
        };

        fetchProjectDetail();

        return () => {
            cancelled = true;
        };
    }, [isEdit, editId]);

    // Membersihkan URL preview ketika komponen dilepas.
    useEffect(() => {
        return () => {
            if (thumbnailPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailPreview);
            }

            docPreviews.forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [thumbnailPreview, docPreviews]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleBack = () => {
        window.location.href = '/projects';
    };

    // Thumbnail mempunyai input tersendiri.
    const handleThumbnailChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Thumbnail harus berupa file gambar.');
            event.target.value = '';
            return;
        }

        if (thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailPreview);
        }

        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setError('');

        // Memungkinkan pemilihan file yang sama lagi.
        event.target.value = '';
    };

    // Input ini khusus untuk beberapa gambar dokumentasi.
    const handleDocFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter((file) =>
            file.type.startsWith('image/')
        );

        if (validFiles.length !== files.length) {
            setError('Semua file dokumentasi harus berupa gambar.');
        } else {
            setError('');
        }

        if (validFiles.length > 0) {
            setDocFiles((previous) => [...previous, ...validFiles]);

            setDocPreviews((previous) => [
                ...previous,
                ...validFiles.map((file) => URL.createObjectURL(file)),
            ]);
        }

        event.target.value = '';
    };

    const removeDocPreview = (index) => {
        const preview = docPreviews[index];

        if (preview?.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        setDocFiles((previous) =>
            previous.filter((_, itemIndex) => itemIndex !== index)
        );

        setDocPreviews((previous) =>
            previous.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const removeThumbnail = () => {
        if (thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailPreview);
        }

        setThumbnailFile(null);
        setThumbnailPreview('');
    };

    const removeExistingImage = (index) => {
        setExistingImages((previous) =>
            previous.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            setError('Project Title wajib diisi.');
            return;
        }

        if (
            formData.start_date &&
            formData.end_date &&
            formData.end_date < formData.start_date
        ) {
            setError('Tanggal selesai tidak boleh sebelum tanggal mulai.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccessMsg('');

            const submitData = new FormData();

            submitData.append('title', formData.title.trim());
            submitData.append('subtitle', formData.subtitle);
            submitData.append('category', formData.category);
            submitData.append('technologies', formData.technologies);
            submitData.append('role', formData.role);
            submitData.append('start_date', formData.start_date);
            submitData.append('end_date', formData.end_date);
            submitData.append('description', formData.description);

            if (thumbnailFile) {
                submitData.append('thumbnail', thumbnailFile);
            }

            // Gunakan images[] agar Laravel menerima banyak file.
            docFiles.forEach((file) => {
                submitData.append('images[]', file);
            });

            // Memberi tahu backend gambar lama yang masih dipertahankan.
            // Controller update harus memproses field ini agar penghapusan
            // gambar lama benar-benar tersimpan ke database.
            if (isEdit) {
                submitData.append(
                    'existing_images',
                    JSON.stringify(existingImages.map((image) => image.path))
                );

                // Mendukung route Laravel yang menggunakan PUT/PATCH.
                submitData.append('_method', 'PUT');
            }

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const url = isEdit
                ? `/api/projects/${editId}`
                : '/api/projects';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(getErrorMessage(result));
            }

            setSuccessMsg(
                isEdit
                    ? 'Proyek berhasil diperbarui!'
                    : 'Proyek berhasil ditambahkan!'
            );

            window.setTimeout(() => {
                window.location.href = '/projects';
            }, 1000);
        } catch (err) {
            setError(
                err.message || 'Terjadi kesalahan saat menyimpan proyek.'
            );
        } finally {
            setLoading(false);
        }
    };

    const navbarTitle = (
        <div className="flex items-center gap-2">
            <span>Project Page</span>
            <span className="text-white/70">&gt;</span>
            <span className="font-semibold">
                {isEdit ? 'Edit Project' : 'Add Project'}
            </span>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Navbar title={navbarTitle} icon={FileUser} />

                <main className="project-page">
                    <div className="project-page-header">
                        <div>
                            <h1>
                                {isEdit
                                    ? 'Edit Your Project'
                                    : 'Add Your New Project'}
                            </h1>
                        </div>

                        <button
                            type="button"
                            className="project-back-button"
                            onClick={handleBack}
                        >
                            <ChevronLeft size={16} />
                            <span>Back</span>
                        </button>
                    </div>

                    {error && (
                        <div className="project-alert project-alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => setError('')}
                                aria-label="Tutup pesan error"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {successMsg && (
                        <div className="project-alert project-alert-success">
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {fetching ? (
                        <div className="project-card">
                            <div className="project-loading">
                                <div className="project-spinner" />
                                <span>Memuat detail project...</span>
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="project-form-card"
                        >
                            <div className="project-form-grid">
                                <div className="project-form-col">
                                    <div className="project-form-group">
                                        <label htmlFor="title">
                                            Project Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            className="project-input"
                                            placeholder="Enter your project name"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="project-form-group">
                                        <label htmlFor="category">
                                            Category
                                        </label>
                                        <div className="project-input-wrapper">
                                            <select
                                                id="category"
                                                name="category"
                                                className="project-select"
                                                value={formData.category}
                                                onChange={handleChange}
                                            >
                                                <option value="">
                                                    Select project category
                                                </option>
                                                <option value="Tugas Akhir">
                                                    Tugas Akhir
                                                </option>
                                                <option value="Internship">
                                                    Internship
                                                </option>
                                                <option value="Academic Project">
                                                    Academic Project
                                                </option>
                                                <option value="Personal Project">
                                                    Personal Project
                                                </option>
                                                <option value="Freelance">
                                                    Freelance
                                                </option>
                                            </select>
                                            <ChevronDown
                                                size={18}
                                                className="project-select-icon"
                                            />
                                        </div>
                                    </div>

                                    <div className="project-form-group">
                                        <label htmlFor="technologies">
                                            Technologies
                                        </label>
                                        <input
                                            type="text"
                                            id="technologies"
                                            name="technologies"
                                            className="project-input"
                                            placeholder="Misal: React.js, Laravel, PostgreSQL"
                                            value={formData.technologies}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="project-form-group">
                                        <label htmlFor="role">Role</label>
                                        <div className="project-input-wrapper">
                                            <select
                                                id="role"
                                                name="role"
                                                className="project-select"
                                                value={formData.role}
                                                onChange={handleChange}
                                            >
                                                <option value="">
                                                    Choose your role
                                                </option>
                                                <option value="Fullstack Developer">
                                                    Fullstack Developer
                                                </option>
                                                <option value="Frontend Developer">
                                                    Frontend Developer
                                                </option>
                                                <option value="Backend Developer">
                                                    Backend Developer
                                                </option>
                                                <option value="Mobile Developer">
                                                    Mobile Developer
                                                </option>
                                                <option value="UI/UX Designer">
                                                    UI/UX Designer
                                                </option>
                                                <option value="DevOps Engineer">
                                                    DevOps Engineer
                                                </option>
                                            </select>
                                            <ChevronDown
                                                size={18}
                                                className="project-select-icon"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="project-form-col">
                                    <div className="project-form-group">
                                        <label htmlFor="subtitle">
                                            Project Subtitle
                                        </label>
                                        <input
                                            type="text"
                                            id="subtitle"
                                            name="subtitle"
                                            className="project-input"
                                            placeholder="Enter project subtitle"
                                            value={formData.subtitle}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="project-form-group">
                                        <label>Duration</label>
                                        <div className="project-duration-group">
                                            <div className="project-date-input">
                                                <input
                                                    type="date"
                                                    id="start_date"
                                                    name="start_date"
                                                    value={formData.start_date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="project-date-input">
                                                <input
                                                    type="date"
                                                    id="end_date"
                                                    name="end_date"
                                                    value={formData.end_date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-form-group">
                                        <label htmlFor="description">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            className="project-textarea"
                                            placeholder="Description of your project"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="project-form-group">
                                        <label>Project Thumbnail</label>

                                        <div className="project-image-upload-container">
                                            {thumbnailPreview ? (
                                                <div className="project-image-box">
                                                    <img
                                                        src={thumbnailPreview}
                                                        alt="Project thumbnail"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="project-image-remove"
                                                        onClick={removeThumbnail}
                                                        aria-label="Hapus thumbnail"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="project-image-box">
                                                    <ImageIcon size={28} />
                                                </div>
                                            )}

                                            <label
                                                htmlFor="thumbnail-upload-input"
                                                className="project-image-add-btn"
                                                title="Pilih thumbnail"
                                            >
                                                <Plus size={20} />
                                            </label>

                                            <input
                                                type="file"
                                                id="thumbnail-upload-input"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleThumbnailChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>

                                        <small>
                                            Thumbnail digunakan sebagai gambar
                                            utama pada kartu proyek.
                                        </small>
                                    </div>

                                    <div className="project-form-group">
                                        <label>Image Documentation</label>

                                        <div className="project-image-upload-container">
                                            {existingImages.map((image, index) => (
                                                <div
                                                    key={image.id}
                                                    className="project-image-box"
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={
                                                            image.caption ||
                                                            `Dokumentasi ${index + 1}`
                                                        }
                                                        onError={(event) => {
                                                            event.currentTarget.style.opacity = '0.35';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="project-image-remove"
                                                        onClick={() =>
                                                            removeExistingImage(index)
                                                        }
                                                        aria-label="Hapus dokumentasi lama"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            {docPreviews.map((preview, index) => (
                                                <div
                                                    key={`${preview}-${index}`}
                                                    className="project-image-box"
                                                >
                                                    <img
                                                        src={preview}
                                                        alt={`Dokumentasi baru ${index + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="project-image-remove"
                                                        onClick={() =>
                                                            removeDocPreview(index)
                                                        }
                                                        aria-label="Hapus dokumentasi baru"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            {existingImages.length === 0 &&
                                                docPreviews.length === 0 && (
                                                    <div className="project-image-box">
                                                        <ImageIcon size={28} />
                                                    </div>
                                                )}

                                            <label
                                                htmlFor="documentation-upload-input"
                                                className="project-image-add-btn"
                                                title="Tambah gambar dokumentasi"
                                            >
                                                <Plus size={20} />
                                            </label>

                                            <input
                                                type="file"
                                                id="documentation-upload-input"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                onChange={handleDocFilesChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>

                                        <small>
                                            Pilih satu atau beberapa gambar.
                                            Gambar-gambar ini akan ditampilkan
                                            di Documentation Archive.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="project-form-actions">
                                <button
                                    type="button"
                                    className="project-cancel-btn"
                                    onClick={handleBack}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="project-save-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Saving...'
                                        : isEdit
                                            ? 'Save Changes'
                                            : 'Add Project'}
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}
