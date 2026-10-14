import React, { useEffect, useRef, useState } from 'react';

import {
    Briefcase,
    Plus,
    Search,
    ChevronDown,
    Pencil,
    Trash2,
    ExternalLink,
    X,
    Calendar,
    AlertCircle,
    ImagePlus,
    Upload,
    Building2,
    Users,
    Loader2,
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/experience.css';

export default function Experience() {
    // =========================================================
    // DATA STATE
    // =========================================================

    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // ALERT
    // =========================================================

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // =========================================================
    // SEARCH & FILTER
    // =========================================================

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');

    // =========================================================
    // ADD / EDIT MODAL
    // =========================================================

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    // =========================================================
    // DETAIL MODAL
    // =========================================================

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState(null);

    // =========================================================
    // PHOTO STATE
    // =========================================================

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    const photoInputRef = useRef(null);
    const logoInputRef = useRef(null);

    // =========================================================
    // COMPANY LOGO
    // =========================================================

    const [companyLogo, setCompanyLogo] = useState(null);
    const [companyLogoPreview, setCompanyLogoPreview] = useState('');

    // =========================================================
    // FORM
    // =========================================================

    const initialFormData = {
        type: 'work',
        position: '',
        company: '',
        employment_type: 'Full-time',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        technologies_input: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    // =========================================================
    // TECHNOLOGIES
    // =========================================================

    const [techTags, setTechTags] = useState([]);

    // =========================================================
    // EXISTING PHOTOS
    // =========================================================

    const [existingPhotos, setExistingPhotos] = useState([]);
    const [deletingPhotoId, setDeletingPhotoId] = useState(null);

    // =========================================================
    // FETCH EXPERIENCE
    // =========================================================

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            setError('');

            let url = '/api/experiences';

            const params = new URLSearchParams();

            if (searchQuery.trim()) {
                params.append('q', searchQuery.trim());
            }

            if (filterType !== 'All') {
                params.append('type', filterType);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Gagal mengambil data experience.'
                );
            }

            setExperiences(data.experiences || []);
        } catch (err) {
            setError(
                err.message ||
                    'Terjadi kesalahan saat mengambil data experience.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, [filterType]);

    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchExperiences();
        }
    };

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setFormData(initialFormData);
        setTechTags([]);

        setSelectedPhotos([]);
        setPhotoPreviews([]);

        setExistingPhotos([]);

        setCompanyLogo(null);
        setCompanyLogoPreview('');

        if (photoInputRef.current) {
            photoInputRef.current.value = '';
        }

        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const handleOpenAddModal = () => {
        setEditingId(null);

        resetForm();

        setError('');
        setMessage('');

        setIsModalOpen(true);
    };

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const handleOpenEditModal = (exp) => {
        setEditingId(exp.id);

        let tags = [];

        if (Array.isArray(exp.technologies)) {
            tags = exp.technologies;
        } else if (
            typeof exp.technologies === 'string' &&
            exp.technologies
        ) {
            try {
                const parsed = JSON.parse(exp.technologies);

                if (Array.isArray(parsed)) {
                    tags = parsed;
                } else {
                    tags = exp.technologies
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean);
                }
            } catch {
                tags = exp.technologies
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean);
            }
        }

        setFormData({
            type: exp.type || 'work',
            position: exp.position || '',
            company: exp.company || '',
            employment_type: exp.employment_type || 'Full-time',
            location: exp.location || '',
            start_date: exp.start_date
                ? exp.start_date.split('T')[0]
                : '',
            end_date: exp.end_date
                ? exp.end_date.split('T')[0]
                : '',
            is_current: Boolean(exp.is_current),
            description: exp.description || '',
            technologies_input: '',
        });

        setTechTags(tags);

        setExistingPhotos(
            Array.isArray(exp.photos)
                ? [...exp.photos].sort(
                      (a, b) =>
                          Number(a.order || 0) -
                          Number(b.order || 0)
                  )
                : []
        );

        setSelectedPhotos([]);
        setPhotoPreviews([]);

        setCompanyLogo(null);

        if (exp.company_logo) {
            setCompanyLogoPreview(getImageUrl(exp.company_logo));
        } else {
            setCompanyLogoPreview('');
        }

        setError('');
        setMessage('');

        setIsModalOpen(true);
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleCloseModal = () => {
        if (saving) return;

        setIsModalOpen(false);

        resetForm();

        setEditingId(null);
    };

    // =========================================================
    // TECHNOLOGY TAG
    // =========================================================

    const handleAddTag = (e) => {
        if (
            (e.key === 'Enter' || e.key === ',') &&
            formData.technologies_input.trim()
        ) {
            e.preventDefault();

            const newTag = formData.technologies_input
                .trim()
                .replace(/,$/, '');

            if (newTag && !techTags.includes(newTag)) {
                setTechTags((prev) => [...prev, newTag]);
            }

            setFormData((prev) => ({
                ...prev,
                technologies_input: '',
            }));
        }
    };

    const handleRemoveTag = (indexToRemove) => {
        setTechTags((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };

    // =========================================================
    // IMAGE URL
    // =========================================================

    const getImageUrl = (path) => {
        if (!path) return '';

        if (
            path.startsWith('http://') ||
            path.startsWith('https://') ||
            path.startsWith('/')
        ) {
            return path;
        }

        return `/${path}`;
    };

    // =========================================================
    // PHOTO SELECT
    // =========================================================

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                return false;
            }

            if (file.size > 5 * 1024 * 1024) {
                return false;
            }

            return true;
        });

        if (validFiles.length !== files.length) {
            setError(
                'Beberapa file tidak dapat digunakan. Pastikan file berupa gambar dan maksimal 5 MB per foto.'
            );
        }

        setSelectedPhotos((prev) => [...prev, ...validFiles]);

        const newPreviews = validFiles.map((file) => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setPhotoPreviews((prev) => [...prev, ...newPreviews]);

        e.target.value = '';
    };

    // =========================================================
    // REMOVE NEW PHOTO
    // =========================================================

    const handleRemoveSelectedPhoto = (indexToRemove) => {
        setSelectedPhotos((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );

        setPhotoPreviews((prev) => {
            const target = prev[indexToRemove];

            if (target?.url) {
                URL.revokeObjectURL(target.url);
            }

            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    // =========================================================
    // COMPANY LOGO
    // =========================================================

    const handleCompanyLogoSelect = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Company logo harus berupa file gambar.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran company logo maksimal 5 MB.');
            return;
        }

        setCompanyLogo(file);

        setCompanyLogoPreview(URL.createObjectURL(file));
    };

    const handleRemoveCompanyLogo = () => {
        setCompanyLogo(null);
        setCompanyLogoPreview('');

        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    // =========================================================
    // DELETE EXISTING PHOTO
    // =========================================================

    const handleDeleteExistingPhoto = async (photo) => {
        const confirmed = window.confirm(
            'Apakah Anda yakin ingin menghapus foto ini?'
        );

        if (!confirmed) return;

        try {
            setDeletingPhotoId(photo.id);
            setError('');

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(
                `/api/experience-photos/${photo.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Gagal menghapus foto.'
                );
            }

            setExistingPhotos((prev) =>
                prev.filter((item) => item.id !== photo.id)
            );

            setMessage(
                data.message || 'Foto berhasil dihapus.'
            );
        } catch (err) {
            setError(
                err.message ||
                    'Terjadi kesalahan saat menghapus foto.'
            );
        } finally {
            setDeletingPhotoId(null);
        }
    };

    // =========================================================
    // DELETE EXPERIENCE
    // =========================================================

    const handleDeleteExperience = async (exp) => {
        const confirmed = window.confirm(
            `Apakah Anda yakin ingin menghapus pengalaman "${exp.position} - ${exp.company}"?\n\nSemua foto experience juga akan dihapus.`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(
                `/api/experiences/${exp.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Gagal menghapus experience.'
                );
            }

            setMessage(
                data.message || 'Experience berhasil dihapus.'
            );

            fetchExperiences();
        } catch (err) {
            setError(
                err.message ||
                    'Terjadi kesalahan saat menghapus experience.'
            );
        }
    };

    // =========================================================
    // DETAIL
    // =========================================================

    const handleOpenDetail = (exp) => {
        setSelectedExperience(exp);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedExperience(null);
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!formData.type) {
            setError('Experience Type wajib dipilih.');
            return;
        }

        if (!formData.position.trim()) {
            setError('Position Role wajib diisi.');
            return;
        }

        if (!formData.company.trim()) {
            setError(
                'Company / Organization wajib diisi.'
            );
            return;
        }

        if (!formData.start_date) {
            setError('Start Date wajib diisi.');
            return;
        }

        if (!formData.is_current && !formData.end_date) {
            setError(
                'End Date wajib diisi atau pilih "Currently active".'
            );
            return;
        }

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const bodyData = new FormData();

            bodyData.append('type', formData.type);

            bodyData.append(
                'position',
                formData.position.trim()
            );

            bodyData.append(
                'company',
                formData.company.trim()
            );

            if (formData.employment_type) {
                bodyData.append(
                    'employment_type',
                    formData.employment_type
                );
            }

            if (formData.location.trim()) {
                bodyData.append(
                    'location',
                    formData.location.trim()
                );
            }

            bodyData.append(
                'start_date',
                formData.start_date
            );

            if (!formData.is_current && formData.end_date) {
                bodyData.append(
                    'end_date',
                    formData.end_date
                );
            }

            bodyData.append(
                'is_current',
                formData.is_current ? '1' : '0'
            );

            if (formData.description.trim()) {
                bodyData.append(
                    'description',
                    formData.description
                );
            }

            techTags.forEach((tag, index) => {
                bodyData.append(
                    `technologies[${index}]`,
                    tag
                );
            });

            if (companyLogo) {
                bodyData.append(
                    'company_logo',
                    companyLogo
                );
            }

            selectedPhotos.forEach((file) => {
                bodyData.append('photos[]', file);
            });

            const url = editingId
                ? `/api/experiences/${editingId}`
                : '/api/experiences';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: bodyData,
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const validationMessages =
                        Object.values(result.errors)
                            .flat()
                            .join(' ');

                    throw new Error(validationMessages);
                }

                throw new Error(
                    result.message ||
                        'Gagal menyimpan experience.'
                );
            }

            setMessage(
                editingId
                    ? 'Experience berhasil diperbarui.'
                    : 'Experience berhasil ditambahkan.'
            );

            setIsModalOpen(false);
            setEditingId(null);

            resetForm();

            await fetchExperiences();
        } catch (err) {
            setError(
                err.message ||
                    'Terjadi kesalahan saat menyimpan experience.'
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateString) => {
        if (!dateString) return '-';

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString('id-ID', {
            month: 'short',
            year: 'numeric',
        });
    };

    // =========================================================
    // FORMAT DURATION
    // =========================================================

    const formatDuration = (
        startDateStr,
        endDateStr,
        isCurrent
    ) => {
        if (!startDateStr) return '-';

        const start = new Date(startDateStr);

        const end =
            isCurrent || !endDateStr
                ? new Date()
                : new Date(endDateStr);

        let months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        if (months < 1) {
            months = 1;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years === 0) {
            return `${months} Mos`;
        }

        if (remainingMonths === 0) {
            return `${years} ${
                years === 1 ? 'Year' : 'Years'
            }`;
        }

        return `${years} Yr ${remainingMonths} Mos`;
    };

    // =========================================================
    // TYPE LABEL
    // =========================================================

    const getTypeLabel = (type) => {
        if (type === 'organization') {
            return 'Organization Experience';
        }

        return 'Work Experience';
    };

    // =========================================================
    // TYPE ICON
    // =========================================================

    const getTypeIcon = (type) => {
        if (type === 'organization') {
            return <Users size={15} />;
        }

        return <Briefcase size={15} />;
    };

    // =========================================================
    // NAVBAR
    // =========================================================

    const navbarTitle = (
        <div className="flex items-center gap-2 text-xl font-semibold">
            <span className="text-white/80">
                Dashboard
            </span>

            <span className="text-white/60">
                &gt;
            </span>

            <span className="text-white">
                Experience
            </span>
        </div>
    );

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Navbar
                    title={navbarTitle}
                    icon={Briefcase}
                />

                <main className="experience-page">
                    {/* =====================================================
                        PAGE HEADER
                    ===================================================== */}

                    <div className="experience-page-header">
                        <div>
                            <h1>Manage Experience</h1>

                            <p>
                                Kelola pengalaman kerja dan organisasi
                                yang akan ditampilkan pada portfolio.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="experience-add-button"
                            onClick={handleOpenAddModal}
                        >
                            <Plus
                                size={18}
                                strokeWidth={2.2}
                            />

                            <span>
                                Add Experience
                            </span>
                        </button>
                    </div>

                    {/* =====================================================
                        ALERT ERROR
                    ===================================================== */}

                    {error && (
                        <div className="project-alert project-alert-error mb-4">
                            <AlertCircle size={18} />

                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError('')}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* =====================================================
                        ALERT SUCCESS
                    ===================================================== */}

                    {message && (
                        <div className="project-alert project-alert-success mb-4">
                            <span>{message}</span>

                            <button
                                type="button"
                                onClick={() => setMessage('')}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* =====================================================
                        MAIN CARD
                    ===================================================== */}

                    <div className="experience-card">
                        <div className="experience-toolbar">
                            <div className="experience-search-box">
                                <Search
                                    size={16}
                                    className="experience-search-icon"
                                />

                                <input
                                    type="text"
                                    placeholder="Cari pengalaman..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>

                            <div className="experience-filter-box">
                                <select
                                    className="experience-filter-select"
                                    value={filterType}
                                    onChange={(e) =>
                                        setFilterType(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="All">
                                        Filter: All
                                    </option>

                                    <option value="work">
                                        Work Experience
                                    </option>

                                    <option value="organization">
                                        Organization Experience
                                    </option>
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="experience-filter-icon"
                                />
                            </div>
                        </div>

                        {/* =================================================
                            TABLE
                        ================================================= */}

                        {loading ? (
                            <div className="project-loading">
                                <div className="project-spinner"></div>

                                <span>
                                    Memuat data experience...
                                </span>
                            </div>
                        ) : experiences.length === 0 ? (
                            <div className="project-empty">
                                <Briefcase
                                    size={44}
                                    strokeWidth={1.5}
                                />

                                <h3>
                                    Belum ada data pengalaman
                                </h3>

                                <p>
                                    Silakan klik Add Experience
                                    untuk menambahkan pengalaman
                                    pertama Anda.
                                </p>
                            </div>
                        ) : (
                            <div className="experience-table-wrapper">
                                <table className="experience-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Role</th>
                                            <th>
                                                Company /
                                                Organization
                                            </th>
                                            <th>
                                                Experience Type
                                            </th>
                                            <th>
                                                Position Type
                                            </th>
                                            <th>Duration</th>
                                            <th>Photos</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {experiences.map(
                                            (exp, index) => (
                                                <tr
                                                    key={exp.id}
                                                >
                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td className="experience-role-title">
                                                        {exp.position}
                                                    </td>

                                                    <td className="experience-company-name">
                                                        <div className="flex items-center gap-2">
                                                            {exp.company_logo ? (
                                                                <img
                                                                    src={getImageUrl(
                                                                        exp.company_logo
                                                                    )}
                                                                    alt={
                                                                        exp.company
                                                                    }
                                                                    className="experience-company-logo"
                                                                />
                                                            ) : (
                                                                <div className="experience-company-logo-placeholder">
                                                                    <Building2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </div>
                                                            )}

                                                            <span>
                                                                {
                                                                    exp.company
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`experience-type-badge experience-type-${exp.type}`}
                                                        >
                                                            {getTypeIcon(
                                                                exp.type
                                                            )}

                                                            {getTypeLabel(
                                                                exp.type
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            exp.employment_type ||
                                                            '-'
                                                        }
                                                    </td>

                                                    <td className="experience-duration">
                                                        <div>
                                                            <strong>
                                                                {formatDuration(
                                                                    exp.start_date,
                                                                    exp.end_date,
                                                                    exp.is_current
                                                                )}
                                                            </strong>

                                                            <small>
                                                                {formatDate(
                                                                    exp.start_date
                                                                )}

                                                                {' - '}

                                                                {exp.is_current
                                                                    ? 'Present'
                                                                    : formatDate(
                                                                          exp.end_date
                                                                      )}
                                                            </small>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="experience-photo-count">
                                                            <ImagePlus
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                            {Array.isArray(
                                                                exp.photos
                                                            )
                                                                ? exp
                                                                      .photos
                                                                      .length
                                                                : 0}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="experience-actions">
                                                            <button
                                                                type="button"
                                                                className="experience-action-btn experience-action-view"
                                                                title="Detail"
                                                                onClick={() =>
                                                                    handleOpenDetail(
                                                                        exp
                                                                    )
                                                                }
                                                            >
                                                                <ExternalLink
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="experience-action-btn experience-action-edit"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    handleOpenEditModal(
                                                                        exp
                                                                    )
                                                                }
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="experience-action-btn experience-action-delete"
                                                                title="Hapus"
                                                                onClick={() =>
                                                                    handleDeleteExperience(
                                                                        exp
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="experience-pagination">
                            <span>
                                Showing 1-
                                {experiences.length} of{' '}
                                {experiences.length}
                            </span>

                            <div className="experience-pagination-pages">
                                <button
                                    type="button"
                                    className="experience-page-btn"
                                    disabled
                                >
                                    &lt;
                                </button>

                                <button
                                    type="button"
                                    className="experience-page-btn active"
                                >
                                    1
                                </button>

                                <button
                                    type="button"
                                    className="experience-page-btn"
                                    disabled
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* =========================================================
                    ADD / EDIT MODAL
                ========================================================= */}

                {isModalOpen && (
                    <div className="experience-modal-overlay">
                        <div className="experience-modal-dialog">
                            {/* HEADER */}

                            <div className="experience-modal-header">
                                <div>
                                    <h2>
                                        {editingId
                                            ? 'Edit Experience'
                                            : 'Add New Experience'}
                                    </h2>

                                    <p>
                                        Isi informasi pengalaman
                                        yang ingin ditampilkan.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="experience-modal-close"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                className="experience-modal-form"
                                onSubmit={handleSubmitForm}
                            >
                                {/* =================================================
                                    SCROLLABLE BODY
                                ================================================= */}

                                <div className="experience-modal-body">
                                    <div className="experience-form-grid">

                                        {/* EXPERIENCE TYPE */}

                                        <div className="experience-form-group full-width">
                                            <label>
                                                Experience Type
                                            </label>

                                            <div className="experience-type-selector">
                                                <button
                                                    type="button"
                                                    className={`experience-type-option ${
                                                        formData.type ===
                                                        'work'
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                type: 'work',
                                                            })
                                                        )
                                                    }
                                                >
                                                    <Briefcase
                                                        size={18}
                                                    />

                                                    <div>
                                                        <strong>
                                                            Work
                                                            Experience
                                                        </strong>

                                                        <span>
                                                            Pengalaman
                                                            kerja,
                                                            magang,
                                                            freelance,
                                                            atau
                                                            pekerjaan
                                                            profesional
                                                        </span>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`experience-type-option ${
                                                        formData.type ===
                                                        'organization'
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                type: 'organization',
                                                            })
                                                        )
                                                    }
                                                >
                                                    <Users
                                                        size={18}
                                                    />

                                                    <div>
                                                        <strong>
                                                            Organization
                                                            Experience
                                                        </strong>

                                                        <span>
                                                            Pengalaman
                                                            organisasi,
                                                            kepanitiaan,
                                                            atau
                                                            komunitas
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* POSITION */}

                                        <div className="experience-form-group">
                                            <label htmlFor="position">
                                                Position Role
                                            </label>

                                            <input
                                                type="text"
                                                id="position"
                                                className="experience-form-input"
                                                placeholder={
                                                    formData.type ===
                                                    'organization'
                                                        ? 'e.g. Staff Kaderisasi'
                                                        : 'e.g. Web Developer Intern'
                                                }
                                                value={
                                                    formData.position
                                                }
                                                onChange={(e) =>
                                                    setFormData(
                                                        (prev) => ({
                                                            ...prev,
                                                            position:
                                                                e.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        {/* COMPANY */}

                                        <div className="experience-form-group">
                                            <label htmlFor="company">
                                                {formData.type ===
                                                'organization'
                                                    ? 'Organization Name'
                                                    : 'Company Name'}
                                            </label>

                                            <input
                                                type="text"
                                                id="company"
                                                className="experience-form-input"
                                                placeholder={
                                                    formData.type ===
                                                    'organization'
                                                        ? 'e.g. Himpunan Mahasiswa'
                                                        : 'e.g. Telkom University'
                                                }
                                                value={
                                                    formData.company
                                                }
                                                onChange={(e) =>
                                                    setFormData(
                                                        (prev) => ({
                                                            ...prev,
                                                            company:
                                                                e.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        {/* POSITION TYPE */}

                                        <div className="experience-form-group">
                                            <label htmlFor="employment_type">
                                                Position Type
                                            </label>

                                            <div className="experience-select-wrapper">
                                                <select
                                                    id="employment_type"
                                                    className="experience-form-select"
                                                    value={
                                                        formData.employment_type
                                                    }
                                                    onChange={(e) =>
                                                        setFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                employment_type:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                >
                                                    <option value="Full-time">
                                                        Full-time
                                                    </option>

                                                    <option value="Part-time">
                                                        Part-time
                                                    </option>

                                                    <option value="Internship">
                                                        Internship
                                                    </option>

                                                    <option value="Freelance">
                                                        Freelance
                                                    </option>

                                                    <option value="Contract">
                                                        Contract
                                                    </option>

                                                    <option value="Volunteer">
                                                        Volunteer
                                                    </option>

                                                    <option value="Organization">
                                                        Organization
                                                    </option>
                                                </select>

                                                <ChevronDown
                                                    size={18}
                                                    className="experience-select-icon"
                                                />
                                            </div>
                                        </div>

                                        {/* LOCATION */}

                                        <div className="experience-form-group">
                                            <label htmlFor="location">
                                                Location
                                            </label>

                                            <input
                                                type="text"
                                                id="location"
                                                className="experience-form-input"
                                                placeholder="e.g. Bandung, Indonesia / Remote"
                                                value={
                                                    formData.location
                                                }
                                                onChange={(e) =>
                                                    setFormData(
                                                        (prev) => ({
                                                            ...prev,
                                                            location:
                                                                e.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* DATE */}

                                        <div className="experience-form-group full-width">
                                            <div className="experience-dates-row">
                                                <div className="experience-form-group flex-1">
                                                    <label htmlFor="start_date">
                                                        Start Date
                                                    </label>

                                                    <div className="experience-date-box">
                                                        <input
                                                            type="date"
                                                            id="start_date"
                                                            value={
                                                                formData.start_date
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                setFormData(
                                                                    (
                                                                        prev
                                                                    ) => ({
                                                                        ...prev,
                                                                        start_date:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                        />

                                                        <Calendar
                                                            size={16}
                                                            className="experience-date-icon"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="experience-form-group flex-1">
                                                    <label htmlFor="end_date">
                                                        End Date
                                                    </label>

                                                    <div className="experience-date-box">
                                                        <input
                                                            type="date"
                                                            id="end_date"
                                                            value={
                                                                formData.end_date
                                                            }
                                                            disabled={
                                                                formData.is_current
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                setFormData(
                                                                    (
                                                                        prev
                                                                    ) => ({
                                                                        ...prev,
                                                                        end_date:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                        />

                                                        <Calendar
                                                            size={16}
                                                            className="experience-date-icon"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center pt-5">
                                                    <label className="experience-checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                formData.is_current
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                setFormData(
                                                                    (
                                                                        prev
                                                                    ) => ({
                                                                        ...prev,
                                                                        is_current:
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        end_date:
                                                                            e
                                                                                .target
                                                                                .checked
                                                                                ? ''
                                                                                : prev.end_date,
                                                                    })
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            Currently
                                                            active
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="experience-form-group full-width">
                                            <label htmlFor="description">
                                                Description
                                            </label>

                                            <textarea
                                                id="description"
                                                className="experience-editor-textarea"
                                                placeholder="Deskripsi tugas, tanggung jawab, kontribusi, atau kegiatan..."
                                                rows={6}
                                                value={
                                                    formData.description
                                                }
                                                onChange={(e) =>
                                                    setFormData(
                                                        (prev) => ({
                                                            ...prev,
                                                            description:
                                                                e.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* TECHNOLOGIES */}

                                        <div className="experience-form-group full-width">
                                            <label>
                                                Technologies / Skills
                                            </label>

                                            <div className="experience-tags-container">
                                                {techTags.map(
                                                    (
                                                        tag,
                                                        idx
                                                    ) => (
                                                        <span
                                                            key={`${tag}-${idx}`}
                                                            className="experience-tag-pill"
                                                        >
                                                            {tag}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveTag(
                                                                        idx
                                                                    )
                                                                }
                                                            >
                                                                <X
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                            </button>
                                                        </span>
                                                    )
                                                )}

                                                <input
                                                    type="text"
                                                    className="experience-tag-input"
                                                    placeholder="Ketik skill/technology lalu tekan Enter..."
                                                    value={
                                                        formData.technologies_input
                                                    }
                                                    onChange={(e) =>
                                                        setFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                technologies_input:
                                                                    e
                                                                        .target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    onKeyDown={
                                                        handleAddTag
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* COMPANY LOGO */}

                                        <div className="experience-form-group full-width">
                                            <label>
                                                {formData.type ===
                                                'organization'
                                                    ? 'Organization Logo'
                                                    : 'Company Logo'}
                                            </label>

                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={
                                                    handleCompanyLogoSelect
                                                }
                                            />

                                            <div className="experience-logo-upload">
                                                {companyLogoPreview ? (
                                                    <div className="experience-logo-preview">
                                                        <img
                                                            src={
                                                                companyLogoPreview
                                                            }
                                                            alt="Company Logo Preview"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handleRemoveCompanyLogo
                                                            }
                                                            title="Remove logo"
                                                        >
                                                            <X
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="experience-upload-button"
                                                        onClick={() =>
                                                            logoInputRef.current?.click()
                                                        }
                                                    >
                                                        <Upload
                                                            size={18}
                                                        />

                                                        <span>
                                                            Choose
                                                            Logo
                                                        </span>
                                                    </button>
                                                )}

                                                <span className="experience-upload-hint">
                                                    JPG, JPEG,
                                                    PNG. Max 5 MB.
                                                </span>
                                            </div>
                                        </div>

                                        {/* EXPERIENCE PHOTOS */}

                                        <div className="experience-form-group full-width">
                                            <div className="experience-photo-label-row">
                                                <div>
                                                    <label>
                                                        Experience
                                                        Photos
                                                    </label>

                                                    <p>
                                                        Pilih
                                                        beberapa
                                                        foto
                                                        sekaligus
                                                        dari
                                                        komputer.
                                                    </p>
                                                </div>

                                                <span>
                                                    {existingPhotos.length +
                                                        selectedPhotos.length}{' '}
                                                    Photos
                                                </span>
                                            </div>

                                            <input
                                                ref={
                                                    photoInputRef
                                                }
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={
                                                    handlePhotoSelect
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="experience-photo-upload-area"
                                                onClick={() =>
                                                    photoInputRef.current?.click()
                                                }
                                            >
                                                <ImagePlus
                                                    size={28}
                                                />

                                                <strong>
                                                    Choose
                                                    Multiple
                                                    Photos
                                                </strong>

                                                <span>
                                                    Kamu dapat
                                                    memilih
                                                    beberapa
                                                    foto
                                                    sekaligus
                                                </span>
                                            </button>

                                            {/* EXISTING PHOTOS */}

                                            {existingPhotos.length >
                                                0 && (
                                                <div className="experience-photo-section">
                                                    <h4>
                                                        Existing
                                                        Photos
                                                    </h4>

                                                    <div className="experience-photo-grid">
                                                        {existingPhotos.map(
                                                            (
                                                                photo
                                                            ) => (
                                                                <div
                                                                    className="experience-photo-item"
                                                                    key={
                                                                        photo.id
                                                                    }
                                                                >
                                                                    <img
                                                                        src={getImageUrl(
                                                                            photo.image
                                                                        )}
                                                                        alt="Experience"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteExistingPhoto(
                                                                                photo
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deletingPhotoId ===
                                                                            photo.id
                                                                        }
                                                                        title="Delete photo"
                                                                    >
                                                                        {deletingPhotoId ===
                                                                        photo.id ? (
                                                                            <Loader2
                                                                                size={
                                                                                    15
                                                                                }
                                                                                className="animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <X
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* NEW PHOTOS */}

                                            {photoPreviews.length >
                                                0 && (
                                                <div className="experience-photo-section">
                                                    <h4>
                                                        New Photos
                                                    </h4>

                                                    <div className="experience-photo-grid">
                                                        {photoPreviews.map(
                                                            (
                                                                preview,
                                                                index
                                                            ) => (
                                                                <div
                                                                    className="experience-photo-item experience-photo-new"
                                                                    key={
                                                                        preview.id
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            preview.url
                                                                        }
                                                                        alt={
                                                                            preview.name
                                                                        }
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveSelectedPhoto(
                                                                                index
                                                                            )
                                                                        }
                                                                        title="Remove photo"
                                                                    >
                                                                        <X
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </button>

                                                                    <span>
                                                                        New
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* =================================================
                                    FOOTER
                                ================================================= */}

                                <div className="experience-modal-footer">
                                    <button
                                        type="button"
                                        className="experience-modal-cancel"
                                        onClick={
                                            handleCloseModal
                                        }
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="experience-modal-save"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />

                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Plus
                                                    size={16}
                                                />

                                                {editingId
                                                    ? 'Update Experience'
                                                    : 'Save Experience'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =========================================================
                    DETAIL MODAL
                ========================================================= */}

                {isDetailModalOpen &&
                    selectedExperience && (
                        <div className="experience-modal-overlay">
                            <div className="experience-detail-dialog">
                                <div className="experience-modal-header">
                                    <div>
                                        <span className="experience-detail-type">
                                            {getTypeIcon(
                                                selectedExperience.type
                                            )}

                                            {getTypeLabel(
                                                selectedExperience.type
                                            )}
                                        </span>

                                        <h2>
                                            {
                                                selectedExperience.position
                                            }
                                        </h2>

                                        <p>
                                            {
                                                selectedExperience.company
                                            }
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="experience-modal-close"
                                        onClick={
                                            handleCloseDetail
                                        }
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="experience-detail-body">
                                    <div className="experience-detail-info-grid">
                                        <div>
                                            <span>
                                                Position
                                                Type
                                            </span>

                                            <strong>
                                                {selectedExperience.employment_type ||
                                                    '-'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {selectedExperience.location ||
                                                    '-'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Start Date
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedExperience.start_date
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                End Date
                                            </span>

                                            <strong>
                                                {selectedExperience.is_current
                                                    ? 'Present'
                                                    : formatDate(
                                                          selectedExperience.end_date
                                                      )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="experience-detail-section">
                                        <h4>
                                            Description
                                        </h4>

                                        <p className="experience-detail-description">
                                            {selectedExperience.description ||
                                                'Tidak ada deskripsi.'}
                                        </p>
                                    </div>

                                    {Array.isArray(
                                        selectedExperience.technologies
                                    ) &&
                                        selectedExperience
                                            .technologies
                                            .length > 0 && (
                                            <div className="experience-detail-section">
                                                <h4>
                                                    Technologies
                                                    / Skills
                                                </h4>

                                                <div className="experience-detail-tags">
                                                    {selectedExperience.technologies.map(
                                                        (
                                                            tag,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={`${tag}-${index}`}
                                                            >
                                                                {
                                                                    tag
                                                                }
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {Array.isArray(
                                        selectedExperience.photos
                                    ) &&
                                        selectedExperience
                                            .photos
                                            .length > 0 && (
                                            <div className="experience-detail-section">
                                                <h4>
                                                    Experience
                                                    Photos
                                                </h4>

                                                <div className="experience-detail-photo-grid">
                                                    {selectedExperience.photos.map(
                                                        (
                                                            photo
                                                        ) => (
                                                            <img
                                                                key={
                                                                    photo.id
                                                                }
                                                                src={getImageUrl(
                                                                    photo.image
                                                                )}
                                                                alt="Experience"
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>

                                <div className="experience-modal-footer">
                                    <button
                                        type="button"
                                        className="experience-modal-cancel"
                                        onClick={
                                            handleCloseDetail
                                        }
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        className="experience-modal-save"
                                        onClick={() => {
                                            handleCloseDetail();

                                            handleOpenEditModal(
                                                selectedExperience
                                            );
                                        }}
                                    >
                                        <Pencil size={16} />

                                        Edit Experience
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}