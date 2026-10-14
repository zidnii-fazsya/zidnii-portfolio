import React, { useEffect, useState } from 'react';

import {
    X,
    Camera,
    Save,
    UserRound,
    Tag,
    FileText,
    AlertCircle,
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {

    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [bio, setBio] = useState('');

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Get Profile
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        fetchProfile();

    }, [isOpen]);


    const fetchProfile = async () => {

        try {

            setLoading(true);
            setError('');

            const response = await fetch(
                '/api/profile',
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    'Gagal mengambil data profil.'
                );
            }

            const data = await response.json();

            if (data.profile) {

                setName(
                    data.profile.name || ''
                );

                setTag(
                    data.profile.tag || ''
                );

                setBio(
                    data.profile.bio || ''
                );

                if (data.profile.photo) {

                    setPhotoPreview(
                        `/storage/${data.profile.photo}`
                    );

                } else {

                    setPhotoPreview('');

                }
            }

        } catch (err) {

            setError(
                err.message ||
                'Gagal mengambil data profil.'
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Photo
    |--------------------------------------------------------------------------
    */

    const handlePhotoChange = (event) => {

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
                'Foto harus berupa JPG, PNG, atau WEBP.'
            );

            return;
        }

        if (file.size > 2 * 1024 * 1024) {

            setError(
                'Ukuran foto maksimal 2 MB.'
            );

            return;
        }

        setError('');
        setPhoto(file);

        setPhotoPreview(
            URL.createObjectURL(file)
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Save Profile
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError('');
        setSuccess('');

        if (!name.trim()) {

            setError(
                'Nama wajib diisi.'
            );

            return;
        }

        try {

            setSaving(true);

            const formData = new FormData();

            formData.append(
                'name',
                name.trim()
            );

            formData.append(
                'tag',
                tag.trim()
            );

            formData.append(
                'bio',
                bio.trim()
            );

            if (photo) {

                formData.append(
                    'photo',
                    photo
                );

            }

            const response = await fetch(
                '/api/profile',
                {
                    method: 'POST',

                    headers: {
                        Accept:
                            'application/json',

                        'X-CSRF-TOKEN':
                            document
                                .querySelector(
                                    'meta[name="csrf-token"]'
                                )
                                ?.getAttribute(
                                    'content'
                                ),
                    },

                    body: formData,
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                if (data.errors) {

                    const firstError =
                        Object.values(
                            data.errors
                        )[0]?.[0];

                    throw new Error(
                        firstError ||
                        'Data profil tidak valid.'
                    );
                }

                throw new Error(
                    data.message ||
                    'Gagal menyimpan profil.'
                );
            }

            setSuccess(
                data.message ||
                'Profil berhasil disimpan.'
            );

            setPhoto(null);

            if (data.profile?.photo) {

                setPhotoPreview(
                    `/storage/${data.profile.photo}`
                );

            }

            /*
             * Beri waktu agar user melihat
             * pesan berhasil.
             */

            setTimeout(() => {

                onClose();

                window.dispatchEvent(
                    new Event('profile-updated')
                );

            }, 700);

        } catch (err) {

            setError(
                err.message ||
                'Terjadi kesalahan saat menyimpan profil.'
            );

        } finally {

            setSaving(false);

        }
    };


    if (!isOpen) {
        return null;
    }


    return (
        <div className="profile-modal-overlay">

            <div className="profile-modal">

                {/* HEADER */}

                <div className="profile-modal-header">

                    <div>
                        <h2>
                            Kelola Profil
                        </h2>

                        <p>
                            Kelola informasi profil yang akan ditampilkan pada halaman visitor.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="profile-modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* BODY */}

                <div className="profile-modal-body">

                    {loading ? (

                        <div className="profile-loading">
                            Memuat data profil...
                        </div>

                    ) : (

                        <form
                            onSubmit={handleSubmit}
                        >

                            {error && (

                                <div className="profile-alert profile-alert-error">

                                    <AlertCircle
                                        size={18}
                                    />

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            )}


                            {success && (

                                <div className="profile-alert profile-alert-success">

                                    <span>
                                        {success}
                                    </span>

                                </div>

                            )}


                            {/* FOTO */}

                            <div className="profile-photo-section">

                                <div className="profile-photo-preview">

                                    {photoPreview ? (

                                        <img
                                            src={
                                                photoPreview
                                            }
                                            alt="Profile"
                                        />

                                    ) : (

                                        <UserRound
                                            size={48}
                                            strokeWidth={1.4}
                                        />

                                    )}

                                </div>


                                <div className="profile-photo-content">

                                    <h3>
                                        Foto Profil
                                    </h3>

                                    <p>
                                        Foto ini akan ditampilkan pada halaman visitor.
                                    </p>

                                    <label className="profile-photo-button">

                                        <Camera
                                            size={16}
                                        />

                                        Choose Photo

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                handlePhotoChange
                                            }
                                        />

                                    </label>

                                    <small>
                                        JPG, PNG atau WEBP. Maksimal 2 MB.
                                    </small>

                                </div>

                            </div>


                            {/* NAMA */}

                            <div className="profile-form-group">

                                <label>
                                    <UserRound
                                        size={16}
                                    />

                                    Nama
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Masukkan nama"
                                />

                            </div>


                            {/* TAG */}

                            <div className="profile-form-group">

                                <label>
                                    <Tag
                                        size={16}
                                    />

                                    Tag Profil
                                </label>

                                <input
                                    type="text"
                                    value={tag}
                                    onChange={(event) =>
                                        setTag(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Contoh: D3 Information Systems Graduate | Web Developer"
                                />

                            </div>


                            {/* BIO */}

                            <div className="profile-form-group">

                                <label>
                                    <FileText
                                        size={16}
                                    />

                                    Tentang Saya
                                </label>

                                <textarea
                                    value={bio}
                                    onChange={(event) =>
                                        setBio(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Tuliskan deskripsi singkat tentang diri Anda..."
                                    rows={6}
                                />

                                <small>
                                    Deskripsi ini akan ditampilkan pada bagian profil/about di halaman visitor.
                                </small>

                            </div>


                            {/* ACTION */}

                            <div className="profile-modal-actions">

                                <button
                                    type="button"
                                    className="profile-cancel-button"
                                    onClick={onClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="profile-save-button"
                                    disabled={saving}
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? 'Saving...'
                                        : 'Save Profile'
                                    }

                                </button>

                            </div>

                        </form>

                    )}

                </div>

            </div>

        </div>
    );
}