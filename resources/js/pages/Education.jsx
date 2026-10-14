import React, { useEffect, useState } from 'react';
import {
    GraduationCap,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ArrowLeft,
    Upload,
    X,
    Save,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/education.css';

export default function Education() {
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [view, setView] = useState('list');
    const [editingEducation, setEditingEducation] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | SELECTED EDUCATION
    |--------------------------------------------------------------------------
    */

    const [selectedEducation, setSelectedEducation] = useState(null);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [logoPreview, setLogoPreview] = useState(null);

    const [form, setForm] = useState({
        institution: '',
        degree: '',
        start_year: '',
        end_year: '',
        final_grade: '',
        description: '',
        logo: null,
    });

    /*
    |--------------------------------------------------------------------------
    | CSRF TOKEN
    |--------------------------------------------------------------------------
    */

    const getCsrfToken = () => {
        return document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
    };

    /*
    |--------------------------------------------------------------------------
    | FETCH EDUCATION
    |--------------------------------------------------------------------------
    */

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
            });

            if (!response.ok) {
                throw new Error(
                    'Gagal mengambil data pendidikan.'
                );
            }

            const data = await response.json();

            setEducations(data.educations || []);
        } catch (err) {
            console.error(err);

            setError(
                'Data pendidikan gagal dimuat. Silakan refresh halaman.'
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchEducations();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FORM HANDLER
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | LOGO HANDLER
    |--------------------------------------------------------------------------
    */

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                'Logo harus berformat JPG, JPEG, PNG, atau WEBP.'
            );

            event.target.value = '';

            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError(
                'Ukuran logo maksimal 2 MB.'
            );

            event.target.value = '';

            return;
        }

        setError('');

        setForm((previous) => ({
            ...previous,
            logo: file,
        }));

        const previewUrl = URL.createObjectURL(file);

        setLogoPreview(previewUrl);
    };

    /*
    |--------------------------------------------------------------------------
    | RESET FORM
    |--------------------------------------------------------------------------
    */

    const resetForm = () => {
        setForm({
            institution: '',
            degree: '',
            start_year: '',
            end_year: '',
            final_grade: '',
            description: '',
            logo: null,
        });

        setLogoPreview(null);
        setEditingEducation(null);
        setError('');
        setMessage('');
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN ADD FORM
    |--------------------------------------------------------------------------
    */

    const handleAddEducation = () => {
        resetForm();

        setView('form');
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN VIEW DETAIL
    |--------------------------------------------------------------------------
    */

    const handleViewEducation = (education) => {
        setSelectedEducation(education);
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE VIEW DETAIL
    |--------------------------------------------------------------------------
    */

    const handleCloseEducationDetail = () => {
        setSelectedEducation(null);
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT FORM
    |--------------------------------------------------------------------------
    */

    const handleEditEducation = (education) => {
        setEditingEducation(education);

        setForm({
            institution: education.institution || '',
            degree: education.degree || '',
            start_year: education.start_year || '',
            end_year: education.end_year || '',
            final_grade: education.final_grade || '',
            description: education.description || '',
            logo: null,
        });

        if (education.logo) {
            setLogoPreview(
                `/storage/${education.logo}`
            );
        } else {
            setLogoPreview(null);
        }

        setError('');
        setMessage('');
        setView('form');
    };

    /*
    |--------------------------------------------------------------------------
    | BACK TO LIST
    |--------------------------------------------------------------------------
    */

    const handleBackToList = () => {
        resetForm();

        setView('list');
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT FORM
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError('');
        setMessage('');

        try {
            const formData = new FormData();

            formData.append(
                'institution',
                form.institution
            );

            formData.append(
                'degree',
                form.degree
            );

            formData.append(
                'start_year',
                form.start_year
            );

            formData.append(
                'end_year',
                form.end_year
            );

            formData.append(
                'final_grade',
                form.final_grade
            );

            formData.append(
                'description',
                form.description
            );

            if (form.logo) {
                formData.append(
                    'logo',
                    form.logo
                );
            }

            let url = '/api/educations';
            let method = 'POST';

            /*
            |--------------------------------------------------------------------------
            | EDIT
            |--------------------------------------------------------------------------
            */

            if (editingEducation) {
                url = `/api/educations/${editingEducation.id}`;

                /*
                 * Laravel method spoofing.
                 * Digunakan karena upload file + PUT
                 * terkadang tidak terbaca dengan baik.
                 */

                formData.append(
                    '_method',
                    'PUT'
                );
            }

            const response = await fetch(url, {
                method,
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: formData,
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError =
                        Object.values(data.errors)
                            .flat()[0];

                    throw new Error(
                        firstError ||
                        'Data pendidikan tidak valid.'
                    );
                }

                throw new Error(
                    data.message ||
                    'Gagal menyimpan data pendidikan.'
                );
            }

            setMessage(
                editingEducation
                    ? 'Data pendidikan berhasil diperbarui.'
                    : 'Data pendidikan berhasil ditambahkan.'
            );

            await fetchEducations();

            setTimeout(() => {
                resetForm();

                setView('list');
            }, 700);
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                'Terjadi kesalahan saat menyimpan data.'
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE EDUCATION
    |--------------------------------------------------------------------------
    */

    const handleDeleteEducation = async (id) => {
        const confirmed = window.confirm(
            'Apakah kamu yakin ingin menghapus data pendidikan ini?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError('');
            setMessage('');

            const response = await fetch(
                `/api/educations/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal menghapus data pendidikan.'
                );
            }

            setMessage(
                'Data pendidikan berhasil dihapus.'
            );

            await fetchEducations();
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                'Terjadi kesalahan saat menghapus data.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE SELECTED LOGO
    |--------------------------------------------------------------------------
    */

    const handleRemoveLogo = () => {
        setForm((previous) => ({
            ...previous,
            logo: null,
        }));

        if (editingEducation?.logo) {
            setLogoPreview(
                `/storage/${editingEducation.logo}`
            );
        } else {
            setLogoPreview(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ACTIVE EDUCATION
    |--------------------------------------------------------------------------
    */

    const currentYear = new Date().getFullYear();

    const activeEducationCount = educations.filter(
        (education) =>
            Number(education.start_year) <= currentYear &&
            Number(education.end_year) >= currentYear
    ).length;

    /*
    |--------------------------------------------------------------------------
    | FORMAT YEAR
    |--------------------------------------------------------------------------
    */

    const formatPeriod = (education) => {
        return `${education.start_year}-${education.end_year}`;
    };

    /*
    |--------------------------------------------------------------------------
    | FORM VIEW
    |--------------------------------------------------------------------------
    */

    if (view === 'form') {
        return (
            <div className="flex min-h-screen bg-[#f5f6f8]">

                <Sidebar />

                <div className="flex-1 min-w-0">

                    <Navbar
                        title={
                            editingEducation
                                ? 'Edit Education'
                                : 'Add Education'
                        }
                        icon={GraduationCap}
                    />

                    <main className="education-page">

                        <div className="education-form-header">

                            <button
                                type="button"
                                className="education-back-button"
                                onClick={handleBackToList}
                            >
                                <ArrowLeft
                                    size={18}
                                    strokeWidth={2}
                                />

                                <span>
                                    Back
                                </span>
                            </button>

                            <div>
                                <h1>
                                    {editingEducation
                                        ? 'Edit Education'
                                        : 'Add Education'}
                                </h1>

                                <p>
                                    Kelola informasi pendidikan kamu
                                    disini!!!
                                </p>
                            </div>

                        </div>

                        {error && (
                            <div className="education-alert education-alert-error">

                                <AlertCircle size={18} />

                                <span>
                                    {error}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setError('')
                                    }
                                >
                                    <X size={16} />
                                </button>

                            </div>
                        )}

                        {message && (
                            <div className="education-alert education-alert-success">

                                <CheckCircle size={18} />

                                <span>
                                    {message}
                                </span>

                            </div>
                        )}

                        <form
                            className="education-form-card"
                            onSubmit={handleSubmit}
                        >

                            <div className="education-form-grid">

                                <div className="education-form-group">

                                    <label htmlFor="institution">
                                        Institution / School
                                    </label>

                                    <input
                                        id="institution"
                                        name="institution"
                                        type="text"
                                        placeholder="Your institution/school"
                                        value={form.institution}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="education-form-group">

                                    <label htmlFor="degree">
                                        Degree Program
                                    </label>

                                    <input
                                        id="degree"
                                        name="degree"
                                        type="text"
                                        placeholder="Your degree program"
                                        value={form.degree}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="education-form-group education-period-group">

                                    <label>
                                        Educational Period
                                    </label>

                                    <div className="education-year-inputs">

                                        <input
                                            name="start_year"
                                            type="number"
                                            min="1900"
                                            max="2100"
                                            placeholder="2023"
                                            value={form.start_year}
                                            onChange={handleChange}
                                            required
                                        />

                                        <span>
                                            -
                                        </span>

                                        <input
                                            name="end_year"
                                            type="number"
                                            min="1900"
                                            max="2100"
                                            placeholder="2026"
                                            value={form.end_year}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                </div>

                                <div className="education-form-group">

                                    <label htmlFor="final_grade">
                                        Final Grade
                                    </label>

                                    <input
                                        id="final_grade"
                                        name="final_grade"
                                        type="text"
                                        placeholder="Your final grade, ex: 3.90/95.00"
                                        value={form.final_grade}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>

                            <div className="education-form-group education-description-group">

                                <label htmlFor="description">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows="5"
                                    placeholder="description of the education or subjects studied"
                                    value={form.description}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="education-form-group">

                                <label>
                                    Institution / School Logo
                                </label>

                                <div className="education-logo-upload">

                                    {logoPreview ? (
                                        <div className="education-logo-preview">

                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                            />

                                            <button
                                                type="button"
                                                className="education-logo-remove"
                                                onClick={handleRemoveLogo}
                                            >
                                                <X size={15} />
                                            </button>

                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="education-logo"
                                            className="education-upload-box"
                                        >

                                            <Upload
                                                size={24}
                                                strokeWidth={1.8}
                                            />

                                            <span>
                                                Choose Image
                                            </span>

                                            <small>
                                                JPG, PNG, WEBP • Max 2 MB
                                            </small>

                                        </label>
                                    )}

                                    <input
                                        id="education-logo"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleLogoChange}
                                        hidden
                                    />

                                </div>

                            </div>

                            <div className="education-form-actions">

                                <button
                                    type="button"
                                    className="education-cancel-button"
                                    onClick={handleBackToList}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="education-save-button"
                                    disabled={saving}
                                >

                                    {saving ? (
                                        <>
                                            <span className="education-spinner"></span>

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save
                                                size={17}
                                                strokeWidth={2}
                                            />

                                            Save Changes
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </main>

                </div>

            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LIST VIEW
    |--------------------------------------------------------------------------
    */

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">

            <Sidebar />

            <div className="flex-1 min-w-0">

                <Navbar
                    title="Education"
                    icon={GraduationCap}
                />

                <main className="education-page">

                    <div className="education-header">

                        <div>

                            <h1>
                                Education
                            </h1>

                            <p>
                                Kelola data pendidikan kamu disini!!!
                            </p>

                        </div>

                        <button
                            type="button"
                            className="education-add-button"
                            onClick={handleAddEducation}
                        >

                            <Plus
                                size={18}
                                strokeWidth={2.2}
                            />

                            <span>
                                Tambah Pendidikan
                            </span>

                        </button>

                    </div>

                    {error && (
                        <div className="education-alert education-alert-error">

                            <AlertCircle size={18} />

                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setError('')
                                }
                            >
                                <X size={16} />
                            </button>

                        </div>
                    )}

                    {message && (
                        <div className="education-alert education-alert-success">

                            <CheckCircle size={18} />

                            <span>
                                {message}
                            </span>

                        </div>
                    )}

                    <div className="education-stat-grid">

                        <div className="education-stat-card">

                            <div className="education-stat-icon">

                                <GraduationCap
                                    size={23}
                                    strokeWidth={1.8}
                                />

                            </div>

                            <div>

                                <span>
                                    Pendidikan
                                </span>

                                <strong>
                                    {educations.length}
                                </strong>

                            </div>

                        </div>

                        <div className="education-stat-card">

                            <div className="education-stat-icon">

                                <CheckCircle
                                    size={22}
                                    strokeWidth={1.8}
                                />

                            </div>

                            <div>

                                <span>
                                    Masa Aktif
                                </span>

                                <strong>
                                    {activeEducationCount}
                                </strong>

                            </div>

                        </div>

                    </div>

                    <section className="education-table-card">

                        <div className="education-table-header">

                            <div>

                                <h2>
                                    Riwayat Pendidikan
                                </h2>

                                <p>
                                    Data pendidikan yang tersimpan
                                    di database.
                                </p>

                            </div>

                        </div>

                        <div className="education-table-wrapper">

                            <table className="education-table">

                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Institution / School
                                        </th>

                                        <th>
                                            Degree Program
                                        </th>

                                        <th>
                                            Year
                                        </th>

                                        <th>
                                            Final Grade
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {loading ? (
                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="education-empty-cell"
                                            >

                                                <div className="education-loading">

                                                    <span className="education-spinner"></span>

                                                    Memuat data pendidikan...

                                                </div>

                                            </td>

                                        </tr>
                                    ) : educations.length === 0 ? (
                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="education-empty-cell"
                                            >

                                                <div className="education-empty">

                                                    <div className="education-empty-icon">

                                                        <GraduationCap
                                                            size={30}
                                                            strokeWidth={1.6}
                                                        />

                                                    </div>

                                                    <h3>
                                                        Belum Ada Data Pendidikan
                                                    </h3>

                                                    <p>
                                                        Tambahkan data pendidikan
                                                        kamu untuk ditampilkan
                                                        di sini.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleAddEducation
                                                        }
                                                        className="education-empty-button"
                                                    >

                                                        <Plus
                                                            size={17}
                                                        />

                                                        Tambah Pendidikan

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    ) : (
                                        educations.map(
                                            (
                                                education,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        education.id
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>

                                                        <div className="education-institution">

                                                            <div className="education-institution-logo">

                                                                {education.logo ? (
                                                                    <img
                                                                        src={`/storage/${education.logo}`}
                                                                        alt={
                                                                            education.institution
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <GraduationCap
                                                                        size={20}
                                                                        strokeWidth={1.7}
                                                                    />
                                                                )}

                                                            </div>

                                                            <span>
                                                                {
                                                                    education.institution
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {
                                                            education.degree
                                                        }
                                                    </td>

                                                    <td>

                                                        <span className="education-year-badge">

                                                            {
                                                                formatPeriod(
                                                                    education
                                                                )
                                                            }

                                                        </span>

                                                    </td>

                                                    <td>

                                                        <span className="education-grade">

                                                            {
                                                                education.final_grade
                                                            }

                                                        </span>

                                                    </td>

                                                    <td>

                                                        <div className="education-description">

                                                            {
                                                                education.description ||
                                                                '-'
                                                            }

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <div className="education-action-buttons">

                                                            {/* VIEW */}

                                                            <button
                                                                type="button"
                                                                className="education-view-button"
                                                                title="View Detail"
                                                                onClick={() =>
                                                                    handleViewEducation(
                                                                        education
                                                                    )
                                                                }
                                                            >

                                                                <Eye
                                                                    size={16}
                                                                    strokeWidth={2}
                                                                />

                                                            </button>

                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                className="education-edit-button"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    handleEditEducation(
                                                                        education
                                                                    )
                                                                }
                                                            >

                                                                <Pencil
                                                                    size={16}
                                                                    strokeWidth={2}
                                                                />

                                                            </button>

                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                className="education-delete-button"
                                                                title="Delete"
                                                                disabled={
                                                                    deletingId ===
                                                                    education.id
                                                                }
                                                                onClick={() =>
                                                                    handleDeleteEducation(
                                                                        education.id
                                                                    )
                                                                }
                                                            >

                                                                {deletingId ===
                                                                education.id ? (
                                                                    <span className="education-spinner-small"></span>
                                                                ) : (
                                                                    <Trash2
                                                                        size={16}
                                                                        strokeWidth={2}
                                                                    />
                                                                )}

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>

                </main>

            </div>

            {/* =====================================================
                EDUCATION DETAIL MODAL
                ===================================================== */}

            {selectedEducation && (
                <div
                    className="education-modal-overlay"
                    onClick={handleCloseEducationDetail}
                >

                    <div
                        className="education-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="education-modal-header">

                            <h2>
                                Education Detail
                            </h2>

                            <button
                                type="button"
                                className="education-modal-close"
                                onClick={
                                    handleCloseEducationDetail
                                }
                                title="Close"
                            >

                                <X
                                    size={18}
                                    strokeWidth={2}
                                />

                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <div className="education-modal-body">

                            {/* PROFILE */}

                            <div className="education-detail-profile">

                                <div className="education-detail-logo">

                                    {selectedEducation.logo ? (
                                        <img
                                            src={`/storage/${selectedEducation.logo}`}
                                            alt={
                                                selectedEducation.institution
                                            }
                                        />
                                    ) : (
                                        <GraduationCap
                                            size={32}
                                            strokeWidth={1.7}
                                        />
                                    )}

                                </div>

                                <div className="education-detail-profile-info">

                                    <h3>
                                        {
                                            selectedEducation.institution
                                        }
                                    </h3>

                                    <p>
                                        {
                                            selectedEducation.degree
                                        }
                                    </p>

                                </div>

                            </div>

                            {/* DETAIL GRID */}

                            <div className="education-detail-grid">

                                <div className="education-detail-item">

                                    <span className="education-detail-label">
                                        Institution / School
                                    </span>

                                    <span className="education-detail-value">
                                        {
                                            selectedEducation.institution
                                        }
                                    </span>

                                </div>

                                <div className="education-detail-item">

                                    <span className="education-detail-label">
                                        Educational Period
                                    </span>

                                    <span className="education-detail-value">
                                        {
                                            formatPeriod(
                                                selectedEducation
                                            )
                                        }
                                    </span>

                                </div>

                                <div className="education-detail-item">

                                    <span className="education-detail-label">
                                        Degree Program
                                    </span>

                                    <span className="education-detail-value">
                                        {
                                            selectedEducation.degree
                                        }
                                    </span>

                                </div>

                                <div className="education-detail-item">

                                    <span className="education-detail-label">
                                        Final Grade
                                    </span>

                                    <span className="education-detail-value">
                                        {
                                            selectedEducation.final_grade
                                        }
                                    </span>

                                </div>

                            </div>

                            {/* DESCRIPTION */}

                            <div className="education-detail-description">

                                <span className="education-detail-label">
                                    Description
                                </span>

                                <p>
                                    {
                                        selectedEducation.description ||
                                        'Tidak ada deskripsi.'
                                    }
                                </p>

                            </div>

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="education-modal-footer">

                            <button
                                type="button"
                                className="education-modal-close-button"
                                onClick={
                                    handleCloseEducationDetail
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}