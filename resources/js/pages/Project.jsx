import React, { useEffect, useState } from 'react';
import {
    FileUser,
    Plus,
    Pencil,
    Trash2,
    AlertCircle,
    X,
    ImageIcon,
    FolderKanban
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/project.css';

export default function Project() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/projects', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data projects.');
            }

            const data = await response.json();
            setProjects(data.projects || []);
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat mengambil data projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAddProject = () => {
        window.location.href = '/projects/add';
    };

    const handleEditProject = (project) => {
        window.location.href = `/projects/edit/${project.id}`;
    };

    const handleDeleteProject = async (project) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin menghapus project "${project.title}"?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menghapus project.');
            }

            setMessage(data.message || 'Project berhasil dihapus.');
            fetchProjects();
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat menghapus project.');
        }
    };

    // Helper for category badge color class
    const getCategoryBadgeClass = (category) => {
        if (!category) return 'cat-default';
        const cat = category.toLowerCase();
        if (cat.includes('tugas akhir')) return 'cat-tugas-akhir';
        if (cat.includes('internship') || cat.includes('magang')) return 'cat-internship';
        if (cat.includes('academic') || cat.includes('akademik')) return 'cat-academic-project';
        return 'cat-default';
    };

    // Helper to parse technologies array
    const renderTechnologies = (tech) => {
        if (!tech) return null;
        let list = [];
        if (Array.isArray(tech)) {
            list = tech;
        } else if (typeof tech === 'string') {
            try {
                const parsed = JSON.parse(tech);
                list = Array.isArray(parsed) ? parsed : tech.split(',');
            } catch {
                list = tech.split(',');
            }
        }

        return (
            <div className="project-tech-group">
                {list.map((item, i) => (
                    <span key={i} className="project-tech-badge">
                        {item.trim()}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 min-w-0">
                {/* Navbar */}
                <Navbar title="Project Page" icon={FileUser} />

                <main className="project-page">
                    {/* Page Header */}
                    <div className="project-page-header">
                        <div>
                            <h1>Project Page</h1>
                            <p>Kelola project anda disini agar tampil di portofolio web anda!!!</p>
                        </div>

                        <button
                            type="button"
                            className="project-add-button"
                            onClick={handleAddProject}
                        >
                            <Plus size={18} strokeWidth={2.2} />
                            <span>Add Project</span>
                        </button>
                    </div>

                    {/* Alert Error */}
                    {error && (
                        <div className="project-alert project-alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                            <button type="button" onClick={() => setError('')}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Alert Success */}
                    {message && (
                        <div className="project-alert project-alert-success">
                            <span>{message}</span>
                            <button type="button" onClick={() => setMessage('')}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Project Card & Table */}
                    <div className="project-card">
                        {loading ? (
                            <div className="project-loading">
                                <div className="project-spinner"></div>
                                <span>Memuat data project...</span>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="project-empty">
                                <FolderKanban size={48} strokeWidth={1.5} />
                                <h3>Belum ada project</h3>
                                <p>Silakan tambahkan project pertama Anda dengan menekan tombol Add Project.</p>
                                <button
                                    type="button"
                                    className="project-add-button"
                                    onClick={handleAddProject}
                                >
                                    <Plus size={16} />
                                    <span>Add Project</span>
                                </button>
                            </div>
                        ) : (
                            <div className="project-table-wrapper">
                                <table className="project-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Project</th>
                                            <th>Technologies</th>
                                            <th>Category</th>
                                            <th>Create at</th>
                                            <th>description</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.map((project, index) => {
                                            const thumbnailUrl = project.thumbnail
                                                ? `/storage/${project.thumbnail}`
                                                : null;

                                            const year =
                                                project.create_year ||
                                                (project.start_date
                                                    ? new Date(project.start_date).getFullYear()
                                                    : new Date(project.created_at || Date.now()).getFullYear());

                                            const shortDesc = project.description
                                                ? project.description.length > 25
                                                    ? project.description.substring(0, 25) + '...'
                                                    : project.description
                                                : project.short_description || '-';

                                            return (
                                                <tr key={project.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className="project-title-cell">
                                                            <div className="project-thumbnail">
                                                                {thumbnailUrl ? (
                                                                    <img
                                                                        src={thumbnailUrl}
                                                                        alt={project.title}
                                                                    />
                                                                ) : (
                                                                    <ImageIcon size={22} />
                                                                )}
                                                            </div>
                                                            <span className="project-title-text">
                                                                {project.title}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>{renderTechnologies(project.technologies)}</td>
                                                    <td>
                                                        {project.category ? (
                                                            <span
                                                                className={`project-category-badge ${getCategoryBadgeClass(
                                                                    project.category
                                                                )}`}
                                                            >
                                                                {project.category}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td>{year}</td>
                                                    <td>{shortDesc}</td>
                                                    <td>
                                                        <div className="project-actions">
                                                            <button
                                                                type="button"
                                                                className="project-action-btn project-action-edit"
                                                                title="Edit Project"
                                                                onClick={() => handleEditProject(project)}
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="project-action-btn project-action-delete"
                                                                title="Hapus Project"
                                                                onClick={() => handleDeleteProject(project)}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
