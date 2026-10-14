import React, { useEffect, useRef, useState } from 'react';

import {
    Save,
    Upload,
    Trash2,
    Image as ImageIcon,
    Loader2,
    User,
    Camera,
    RefreshCw,
} from 'lucide-react';

import "../../css/profile.css";


export default function Profile() {

    /* =========================================================
       STATE
    ========================================================= */

    const [profile, setProfile] = useState({
        name: '',
        tag: '',
        bio: '',
        photo: '',
    });

    const [aboutPhotos, setAboutPhotos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [selectedMainPhoto, setSelectedMainPhoto] =
        useState(null);

    const [selectedAboutPhotos, setSelectedAboutPhotos] =
        useState({});

    const mainPhotoInputRef = useRef(null);

    const aboutPhotoInputRefs = useRef({});


    /* =========================================================
       FETCH PROFILE
    ========================================================= */

    useEffect(() => {
        fetchProfile();
    }, []);


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
                    'Gagal mengambil data profile.'
                );
            }

            const data = await response.json();

            const profileData = data.profile;

            setProfile({
                name: profileData?.name || '',
                tag: profileData?.tag || '',
                bio: profileData?.bio || '',
                photo: profileData?.photo || '',
            });

            setAboutPhotos(
                profileData?.photos || []
            );

        } catch (err) {

            setError(
                err.message ||
                'Terjadi kesalahan saat mengambil data profile.'
            );

        } finally {

            setLoading(false);

        }
    };


    /* =========================================================
       HANDLE PROFILE INPUT
    ========================================================= */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    /* =========================================================
       SAVE PROFILE
    ========================================================= */

    const handleSaveProfile = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setMessage('');
            setError('');

            const formData = new FormData();

            formData.append(
                'name',
                profile.name
            );

            formData.append(
                'tag',
                profile.tag
            );

            formData.append(
                'bio',
                profile.bio
            );

            if (selectedMainPhoto) {

                formData.append(
                    'photo',
                    selectedMainPhoto
                );

            }

            const response = await fetch(
                '/api/profile',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Gagal menyimpan profile.'
                );

            }

            setProfile({
                name: data.profile?.name || '',
                tag: data.profile?.tag || '',
                bio: data.profile?.bio || '',
                photo: data.profile?.photo || '',
            });

            setSelectedMainPhoto(null);

            setMessage(
                'Profile berhasil disimpan.'
            );

        } catch (err) {

            setError(
                err.message ||
                'Gagal menyimpan profile.'
            );

        } finally {

            setSaving(false);

        }
    };


    /* =========================================================
       MAIN PHOTO PREVIEW
    ========================================================= */

    const getMainPhotoPreview = () => {

        if (selectedMainPhoto) {
            return URL.createObjectURL(
                selectedMainPhoto
            );
        }

        if (profile.photo) {
            return `/storage/${profile.photo}`;
        }

        return null;
    };


    /* =========================================================
       HANDLE MAIN PHOTO
    ========================================================= */

    const handleMainPhotoChange = (event) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        setSelectedMainPhoto(file);

    };


    /* =========================================================
       UPLOAD ABOUT PHOTO
    ========================================================= */

    const handleAboutPhotoUpload = async (
        order,
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        try {

            setUploadingPhoto(true);
            setMessage('');
            setError('');

            const formData =
                new FormData();

            formData.append(
                'image',
                file
            );

            formData.append(
                'order',
                order
            );

            const response = await fetch(
                '/api/profile/photos',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                    body: formData,
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Gagal mengupload foto.'
                );

            }

            setAboutPhotos((prev) => [
                ...prev,
                data.photo,
            ].sort(
                (a, b) =>
                    a.order - b.order
            ));

            setMessage(
                `Foto About ${order} berhasil ditambahkan.`
            );

        } catch (err) {

            setError(
                err.message ||
                'Gagal mengupload foto About.'
            );

        } finally {

            setUploadingPhoto(false);

            if (
                aboutPhotoInputRefs.current[order]
            ) {

                aboutPhotoInputRefs.current[
                    order
                ].value = '';

            }
        }
    };


    /* =========================================================
       REPLACE ABOUT PHOTO
    ========================================================= */

    const handleAboutPhotoReplace = async (
        photo,
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        try {

            setUploadingPhoto(true);
            setMessage('');
            setError('');

            const formData =
                new FormData();

            formData.append(
                'image',
                file
            );

            formData.append(
                'order',
                photo.order
            );

            const response =
                await fetch(
                    `/api/profile/photos/${photo.id}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept:
                                'application/json',

                            'X-HTTP-Method-Override':
                                'PUT',
                        },
                        body: formData,
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Gagal mengganti foto.'
                );

            }

            setAboutPhotos((prev) =>
                prev.map((item) =>
                    item.id === photo.id
                        ? data.photo
                        : item
                )
            );

            setMessage(
                `Foto About ${photo.order} berhasil diperbarui.`
            );

        } catch (err) {

            setError(
                err.message ||
                'Gagal mengganti foto About.'
            );

        } finally {

            setUploadingPhoto(false);

            if (
                aboutPhotoInputRefs.current[
                    `replace-${photo.id}`
                ]
            ) {

                aboutPhotoInputRefs.current[
                    `replace-${photo.id}`
                ].value = '';

            }
        }
    };


    /* =========================================================
       DELETE ABOUT PHOTO
    ========================================================= */

    const handleDeleteAboutPhoto = async (
        photo
    ) => {

        const confirmed =
            window.confirm(
                `Hapus foto About ${photo.order}?`
            );

        if (!confirmed) return;

        try {

            setUploadingPhoto(true);
            setMessage('');
            setError('');

            const response =
                await fetch(
                    `/api/profile/photos/${photo.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            Accept:
                                'application/json',
                        },
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Gagal menghapus foto.'
                );

            }

            setAboutPhotos((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== photo.id
                )
            );

            setMessage(
                `Foto About ${photo.order} berhasil dihapus.`
            );

        } catch (err) {

            setError(
                err.message ||
                'Gagal menghapus foto About.'
            );

        } finally {

            setUploadingPhoto(false);
        }
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (
            <div className="profile-page-loading">

                <Loader2
                    size={28}
                    className="profile-loading-icon"
                />

                <span>
                    Loading profile...
                </span>

            </div>
        );
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="profile-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="profile-page-header">

                <div>

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Manage your personal
                        information and About photos.
                    </p>

                </div>

            </div>


            {/* =================================================
                ALERT
            ================================================= */}

            {message && (

                <div className="profile-alert profile-alert-success">

                    {message}

                </div>

            )}


            {error && (

                <div className="profile-alert profile-alert-error">

                    {error}

                </div>

            )}


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <form
                className="profile-card"
                onSubmit={handleSaveProfile}
            >

                <div className="profile-card-header">

                    <div className="profile-card-icon">
                        <User size={19} />
                    </div>

                    <div>

                        <h2>
                            Personal Information
                        </h2>

                        <p>
                            Update your basic profile
                            information.
                        </p>

                    </div>

                </div>


                <div className="profile-form">

                    {/* NAME */}

                    <div className="profile-form-group">

                        <label htmlFor="name">
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />

                    </div>


                    {/* TAG */}

                    <div className="profile-form-group">

                        <label htmlFor="tag">
                            Professional Tagline
                        </label>

                        <input
                            id="tag"
                            type="text"
                            name="tag"
                            value={profile.tag}
                            onChange={handleChange}
                            placeholder="Web Developer | IT System Analyst | Project Management"
                        />

                    </div>


                    {/* BIO */}

                    <div className="profile-form-group">

                        <label htmlFor="bio">
                            About / Bio
                        </label>

                        <textarea
                            id="bio"
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            placeholder="Tell visitors about yourself..."
                            rows={7}
                        />

                        <span className="profile-form-hint">
                            This information will be
                            displayed on your About section.
                        </span>

                    </div>

                </div>


                {/* SAVE */}

                <div className="profile-card-footer">

                    <button
                        type="submit"
                        className="profile-save-button"
                        disabled={saving}
                    >

                        {saving ? (

                            <>
                                <Loader2
                                    size={17}
                                    className="profile-button-spinner"
                                />

                                Saving...
                            </>

                        ) : (

                            <>
                                <Save size={17} />
                                Save Profile
                            </>

                        )}

                    </button>

                </div>

            </form>


            {/* =================================================
                MAIN PROFILE PHOTO
            ================================================= */}

            <div className="profile-card">

                <div className="profile-card-header">

                    <div className="profile-card-icon">
                        <Camera size={19} />
                    </div>

                    <div>

                        <h2>
                            Main Profile Photo
                        </h2>

                        <p>
                            This photo is displayed
                            on the Home section.
                        </p>

                    </div>

                </div>


                <div className="profile-main-photo-section">

                    <div className="profile-main-photo">

                        {getMainPhotoPreview() ? (

                            <img
                                src={
                                    getMainPhotoPreview()
                                }
                                alt={
                                    profile.name ||
                                    'Profile'
                                }
                            />

                        ) : (

                            <div className="profile-photo-empty">

                                <ImageIcon
                                    size={40}
                                />

                                <span>
                                    No Photo
                                </span>

                            </div>

                        )}

                    </div>


                    <div className="profile-main-photo-actions">

                        <input
                            ref={mainPhotoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                                handleMainPhotoChange
                            }
                            hidden
                        />

                        <button
                            type="button"
                            className="profile-upload-button"
                            onClick={() =>
                                mainPhotoInputRef.current?.click()
                            }
                        >

                            <Upload size={17} />

                            {selectedMainPhoto
                                ? 'Change Selected Photo'
                                : 'Choose Photo'}

                        </button>


                        {selectedMainPhoto && (

                            <span className="profile-selected-file">

                                {selectedMainPhoto.name}

                            </span>

                        )}

                        <span className="profile-form-hint">

                            JPG, PNG, or WEBP.
                            Maximum 2 MB.

                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                ABOUT PHOTOS
            ================================================= */}

            <div className="profile-card">

                <div className="profile-card-header">

                    <div className="profile-card-icon">
                        <ImageIcon size={19} />
                    </div>

                    <div>

                        <div className="profile-about-title-row">

                            <div>

                                <h2>
                                    About Photos
                                </h2>

                                <p>
                                    Upload up to 5 photos
                                    for the About section.
                                </p>

                            </div>

                            <span className="profile-photo-counter">

                                {aboutPhotos.length}/5

                            </span>

                        </div>

                    </div>

                </div>


                <div className="profile-about-grid">

                    {Array.from(
                        { length: 5 },
                        (_, index) => {

                            const order =
                                index + 1;

                            const photo =
                                aboutPhotos.find(
                                    (item) =>
                                        Number(
                                            item.order
                                        ) === order
                                );

                            return (

                                <div
                                    key={order}
                                    className={`profile-about-item ${
                                        photo
                                            ? 'has-photo'
                                            : ''
                                    }`}
                                >

                                    {photo ? (

                                        <>

                                            <div className="profile-about-image">

                                                <img
                                                    src={`/${photo.image}`}
                                                    alt={`About ${order}`}
                                                />

                                                <div className="profile-about-overlay">

                                                    <label
                                                        className="profile-photo-action"
                                                        title="Replace photo"
                                                    >

                                                        <RefreshCw
                                                            size={16}
                                                        />

                                                        <input
                                                            ref={(element) => {
                                                                aboutPhotoInputRefs.current[
                                                                    `replace-${photo.id}`
                                                                ] =
                                                                    element;
                                                            }}
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            hidden
                                                            onChange={(event) =>
                                                                handleAboutPhotoReplace(
                                                                    photo,
                                                                    event
                                                                )
                                                            }
                                                        />

                                                    </label>


                                                    <button
                                                        type="button"
                                                        className="profile-photo-action delete"
                                                        onClick={() =>
                                                            handleDeleteAboutPhoto(
                                                                photo
                                                            )
                                                        }
                                                        title="Delete photo"
                                                    >

                                                        <Trash2
                                                            size={16}
                                                        />

                                                    </button>

                                                </div>

                                            </div>

                                            <div className="profile-about-label">

                                                Photo {order}

                                            </div>

                                        </>

                                    ) : (

                                        <>

                                            <input
                                                ref={(element) => {
                                                    aboutPhotoInputRefs.current[
                                                        order
                                                    ] =
                                                        element;
                                                }}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                hidden
                                                onChange={(event) =>
                                                    handleAboutPhotoUpload(
                                                        order,
                                                        event
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="profile-about-empty"
                                                onClick={() =>
                                                    aboutPhotoInputRefs.current[
                                                        order
                                                    ]?.click()
                                                }
                                                disabled={
                                                    uploadingPhoto
                                                }
                                            >

                                                <div className="profile-about-plus">

                                                    <Upload
                                                        size={22}
                                                    />

                                                </div>

                                                <strong>
                                                    Photo {order}
                                                </strong>

                                                <span>
                                                    Upload photo
                                                </span>

                                            </button>

                                        </>

                                    )}

                                </div>

                            );

                        }
                    )}

                </div>


                <div className="profile-about-footer">

                    <span>
                        Recommended: landscape or
                        square images.
                    </span>

                    <span>
                        JPG, PNG, WEBP • Max 5 MB
                    </span>

                </div>

            </div>

        </div>
    );
}