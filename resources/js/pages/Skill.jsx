import React, { useEffect, useState } from 'react';

import {
    BarChart2,
    Plus,
    Eye,
    Pencil,
    Trash2,
    AlertCircle,
    X,
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/skill.css';

export default function Skills() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchSkills = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/skills', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(
                    'Gagal mengambil data skills.'
                );
            }

            const data = await response.json();

            setSkills(data.skills || []);
        } catch (err) {
            setError(
                err.message ||
                'Terjadi kesalahan saat mengambil data skills.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleAddSkill = () => {
        window.location.href = '/skills/add';
    };

    const handleView = (skill) => {
        alert(
            `Skill: ${skill.skill_name}\n` +
            `Level: ${skill.level}\n` +
            `Skill Area: ${skill.skill_area}\n` +
            `Technology: ${skill.technology}`
        );
    };

    const handleEdit = (skill) => {
        window.location.href = `/skills/edit/${skill.id}`;
    };

    const handleDelete = async (skill) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin menghapus skill "${skill.skill_name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError('');
            setMessage('');

            const response = await fetch(
                `/api/skills/${skill.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector(
                                    'meta[name="csrf-token"]'
                                )
                                ?.getAttribute('content'),
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal menghapus skill.'
                );
            }

            setMessage(
                data.message ||
                'Skill berhasil dihapus.'
            );

            fetchSkills();
        } catch (err) {
            setError(
                err.message ||
                'Terjadi kesalahan saat menghapus skill.'
            );
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 min-w-0">

                {/* Navbar */}
                <Navbar
                    title="Skills"
                    icon={BarChart2}
                />

                <main className="skills-page">

                    {/* Page Header */}
                    <div className="skills-page-header">

                        <div>
                            <h1>
                                Add Your Skills
                            </h1>

                            <p>
                                Kelola keterampilan teknis dan profesional Anda disini!!!
                            </p>
                        </div>

                        <button
                            type="button"
                            className="skills-add-button"
                            onClick={handleAddSkill}
                        >
                            <Plus
                                size={18}
                                strokeWidth={2}
                            />

                            Add Skills
                        </button>

                    </div>


                    {/* Error Alert */}
                    {error && (
                        <div className="skills-alert skills-alert-error">

                            <AlertCircle
                                size={18}
                                strokeWidth={2}
                            />

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


                    {/* Success Alert */}
                    {message && (
                        <div className="skills-alert skills-alert-success">

                            <span>
                                {message}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setMessage('')
                                }
                            >
                                <X size={16} />
                            </button>

                        </div>
                    )}


                    {/* Skills Card */}
                    <div className="skills-card">

                        <div className="skills-card-header">

                            <div>
                                <h2>
                                    Skills
                                </h2>

                                <p>
                                    Daftar keterampilan yang kamu miliki.
                                </p>
                            </div>

                        </div>


                        {/* Loading */}
                        {loading ? (

                            <div className="skills-loading">
                                <div className="skills-spinner"></div>

                                <span>
                                    Memuat data skills...
                                </span>
                            </div>

                        ) : skills.length === 0 ? (

                            /* Empty State */
                            <div className="skills-empty">

                                <BarChart2
                                    size={42}
                                    strokeWidth={1.5}
                                />

                                <h3>
                                    Belum ada skill
                                </h3>

                                <p>
                                    Tambahkan skill pertama kamu dengan menekan tombol Add Skills.
                                </p>

                                <button
                                    type="button"
                                    className="skills-empty-button"
                                    onClick={handleAddSkill}
                                >
                                    <Plus
                                        size={17}
                                    />

                                    Add Skills
                                </button>

                            </div>

                        ) : (

                            /* Table */
                            <div className="skills-table-wrapper">

                                <table className="skills-table">

                                    <thead>
                                        <tr>

                                            <th>
                                                No
                                            </th>

                                            <th>
                                                Logo
                                            </th>

                                            <th>
                                                Skill Name
                                            </th>

                                            <th>
                                                Level
                                            </th>

                                            <th>
                                                Skill Area
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {skills.map(
                                            (
                                                skill,
                                                index
                                            ) => {

                                                const logoUrl =
                                                    skill.logo
                                                        ? `/storage/${skill.logo}`
                                                        : null;

                                                return (
                                                    <tr
                                                        key={
                                                            skill.id
                                                        }
                                                    >

                                                        <td>
                                                            {index +
                                                                1}
                                                        </td>

                                                        <td>

                                                            <div className="skill-logo">

                                                                {logoUrl ? (

                                                                    <img
                                                                        src={
                                                                            logoUrl
                                                                        }
                                                                        alt={
                                                                            skill.skill_name
                                                                        }
                                                                    />

                                                                ) : (

                                                                    <span>
                                                                        {skill.skill_name
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase()}
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </td>

                                                        <td>
                                                            <span className="skill-name">
                                                                {
                                                                    skill.skill_name
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={`skill-level skill-level-${skill.level?.toLowerCase()}`}
                                                            >
                                                                {
                                                                    skill.level
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>
                                                            {
                                                                skill.skill_area
                                                            }
                                                        </td>

                                                        <td>

                                                            <div className="skills-actions">

                                                                <button
                                                                    type="button"
                                                                    className="skills-action-view"
                                                                    title="View"
                                                                    onClick={() =>
                                                                        handleView(
                                                                            skill
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="skills-action-edit"
                                                                    title="Edit"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            skill
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
                                                                    className="skills-action-delete"
                                                                    title="Delete"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            skill
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
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                </main>

            </div>

        </div>
    );
}