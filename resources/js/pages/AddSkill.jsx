import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    X,
    AlertCircle,
    BarChart2,
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/skill.css';

export default function AddSkill({ editId = null }) {
    const isEdit = Boolean(editId);

    const [skillName, setSkillName] = useState('');
    const [skillArea, setSkillArea] = useState('');
    const [technology, setTechnology] = useState('');

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState('');

    // Fetch skill details if in edit mode
    useEffect(() => {
        if (isEdit && editId) {
            const fetchSkill = async () => {
                try {
                    setFetching(true);
                    const response = await fetch(`/api/skills/${editId}`, {
                        headers: { Accept: 'application/json' },
                    });

                    if (!response.ok) {
                        throw new Error('Gagal mengambil data skill.');
                    }

                    const data = await response.json();
                    const skill = data.skill;

                    setSkillName(skill.skill_name || '');
                    setSkillArea(skill.skill_area || '');
                    setTechnology(skill.technology || '');

                    if (skill.logo) {
                        setLogoPreview(`/storage/${skill.logo}`);
                    }
                } catch (err) {
                    setError(err.message || 'Terjadi kesalahan saat mengambil data skill.');
                } finally {
                    setFetching(false);
                }
            };

            fetchSkill();
        }
    }, [isEdit, editId]);

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            setError('Logo harus berupa JPG, PNG, atau WEBP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Ukuran logo maksimal 2 MB.');
            return;
        }

        setError('');
        setLogo(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!skillName.trim()) {
            setError('Skill Name wajib diisi.');
            return;
        }

        if (!skillArea) {
            setError('Silakan pilih skill area.');
            return;
        }

        if (!technology.trim()) {
            setError('Technologies wajib diisi.');
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('skill_name', skillName.trim());
            formData.append('level', 'Intermediate');
            formData.append('skill_area', skillArea);
            formData.append('technology', technology.trim());

            if (logo) {
                formData.append('logo', logo);
            }

            const url = isEdit ? `/api/skills/${editId}` : '/api/skills';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0]?.[0];
                    throw new Error(firstError || 'Data skill tidak valid.');
                }
                throw new Error(data.message || 'Gagal menyimpan skill.');
            }

            window.location.href = '/skills';
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat menyimpan skill.');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        window.location.href = '/skills';
    };

    const handleCancel = () => {
        window.location.href = '/skills';
    };

    const handleRemoveLogo = () => {
        setLogo(null);
        setLogoPreview('');
    };

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Navbar
                    title={isEdit ? 'Skills > Edit Skill' : 'Skills > Add Skills'}
                    icon={BarChart2}
                />

                <main className="skills-page skills-add-page">
                    <div className="skills-page-header">
                        <div>
                            <h1>{isEdit ? 'Edit Your Skill' : 'Add Your Skills'}</h1>
                        </div>

                        <button
                            type="button"
                            className="skills-back-button"
                            onClick={handleBack}
                        >
                            <ArrowLeft size={17} />
                            Back
                        </button>
                    </div>

                    {error && (
                        <div className="skills-alert skills-alert-error">
                            <AlertCircle size={18} strokeWidth={2} />
                            <span>{error}</span>
                            <button type="button" onClick={() => setError('')}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {fetching ? (
                        <div className="skills-card">
                            <div className="skills-loading">
                                <div className="skills-spinner"></div>
                                <span>Memuat data skill...</span>
                            </div>
                        </div>
                    ) : (
                        <form className="skills-add-form" onSubmit={handleSubmit}>
                            <div className="skills-form-card">
                                <div className="skills-form-group">
                                    <label htmlFor="skill-name">Skill Name</label>
                                    <input
                                        id="skill-name"
                                        type="text"
                                        value={skillName}
                                        onChange={(e) => setSkillName(e.target.value)}
                                        placeholder="Skill Name"
                                    />
                                </div>

                                <div className="skills-form-group">
                                    <label htmlFor="skill-area">Skill Area</label>
                                    <select
                                        id="skill-area"
                                        value={skillArea}
                                        onChange={(e) => setSkillArea(e.target.value)}
                                    >
                                        <option value="">Select your skill area</option>
                                        <option value="Front-end">Front-end</option>
                                        <option value="Back-end">Back-end</option>
                                        <option value="Database">Database</option>
                                        <option value="UI/UX">UI/UX</option>
                                        <option value="Tools">Tools</option>
                                        <option value="Project Management">Project Management</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="skills-form-group">
                                    <label htmlFor="technology">Technologies</label>
                                    <select
                                        id="technology"
                                        value={technology}
                                        onChange={(e) => setTechnology(e.target.value)}
                                    >
                                        <option value="">Choose your technologies project</option>
                                        <option value="HTML">HTML</option>
                                        <option value="CSS">CSS</option>
                                        <option value="JavaScript">JavaScript</option>
                                        <option value="React">React</option>
                                        <option value="PHP">PHP</option>
                                        <option value="Laravel">Laravel</option>
                                        <option value="MySQL">MySQL</option>
                                        <option value="Git">Git</option>
                                        <option value="Figma">Figma</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="skills-form-group">
                                    <label>Technologies Logo</label>
                                    <div className="skills-upload-box">
                                        {logoPreview ? (
                                            <div className="skills-logo-preview">
                                                <img src={logoPreview} alt="Logo preview" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    title="Remove logo"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="skills-upload-button">
                                                <span>Choose Image</span>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleLogoChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <small>JPG, PNG, atau WEBP. Maksimal 2 MB.</small>
                                </div>
                            </div>

                            <div className="skills-form-actions">
                                <button
                                    type="button"
                                    className="skills-cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="skills-save-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="skills-button-spinner"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}