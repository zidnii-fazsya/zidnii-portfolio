import React, { useEffect, useState } from 'react';
import {
    MessageCircle,
    Search,
    ChevronDown,
    Pencil,
    Trash2,
    AlertCircle,
    X,
    Inbox
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/message.css';

export default function Message() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alertMsg, setAlertMsg] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError('');

            let url = '/api/messages';
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (statusFilter !== 'All') params.append('status', statusFilter);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data pesan.');
            }

            const data = await response.json();
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat mengambil data pesan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [statusFilter]);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchMessages();
        }
    };

    const handleViewDetail = (msg) => {
        window.location.href = `/messages/${msg.id}`;
    };

    const handleDeleteMessage = async (msg) => {
        const confirmed = window.confirm(
            `Apakah Anda yakin ingin menghapus pesan dari "${msg.name}" (${msg.email})?`
        );
        if (!confirmed) return;

        try {
            setError('');
            setAlertMsg('');

            const response = await fetch(`/api/messages/${msg.id}`, {
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
                throw new Error(data.message || 'Gagal menghapus pesan.');
            }

            setAlertMsg(data.message || 'Pesan berhasil dihapus.');
            fetchMessages();
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat menghapus pesan.');
        }
    };

    const getStatusBadge = (status) => {
        const s = status ? status.toLowerCase() : 'new';
        if (s === 'replied') {
            return <span className="msg-status-badge status-replied">Replied</span>;
        }
        if (s === 'read') {
            return <span className="msg-status-badge status-read">Read</span>;
        }
        return <span className="msg-status-badge status-new">New</span>;
    };

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Navbar title="Message" icon={MessageCircle} />

                <main className="message-page">
                    {/* Page Header */}
                    <div className="message-page-header">
                        <div>
                            <h1>Message</h1>
                            <p>Kelola pesan yang masuk dari form!!!</p>
                        </div>

                        <div className="message-controls-group">
                            <div className="message-search-box">
                                <Search size={16} className="message-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search Message"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>

                            <div className="message-filter-box">
                                <select
                                    className="message-filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">Message Status</option>
                                    <option value="New">New</option>
                                    <option value="Read">Read</option>
                                    <option value="Replied">Replied</option>
                                </select>
                                <ChevronDown size={16} className="message-filter-icon" />
                            </div>
                        </div>
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

                    {alertMsg && (
                        <div className="project-alert project-alert-success mb-4">
                            <span>{alertMsg}</span>
                            <button type="button" onClick={() => setAlertMsg('')}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Card Container */}
                    <div className="message-card">
                        <div className="message-card-header">
                            <h2>Daftar Pesan</h2>
                        </div>

                        {loading ? (
                            <div className="project-loading">
                                <div className="project-spinner"></div>
                                <span>Memuat pesan...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="project-empty">
                                <Inbox size={44} strokeWidth={1.5} />
                                <h3>Belum ada pesan masuk</h3>
                                <p>Pesan yang dikirim pengunjung portofolio Anda akan muncul di sini.</p>
                            </div>
                        ) : (
                            <div className="message-table-wrapper">
                                <table className="message-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Email</th>
                                            <th>Name</th>
                                            <th>Subject</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messages.map((msg, index) => {
                                            const formattedDate = msg.created_at
                                                ? new Date(msg.created_at).toLocaleDateString('id-ID', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                : '-';

                                            return (
                                                <tr key={msg.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="font-semibold text-gray-800">{msg.email}</td>
                                                    <td>{msg.name}</td>
                                                    <td>{msg.subject || '-'}</td>
                                                    <td>{formattedDate}</td>
                                                    <td>{getStatusBadge(msg.status)}</td>
                                                    <td>
                                                        <div className="message-actions">
                                                            <button
                                                                type="button"
                                                                className="message-action-btn message-action-view"
                                                                title="Lihat Detail"
                                                                onClick={() => handleViewDetail(msg)}
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="message-action-btn message-action-delete"
                                                                title="Hapus"
                                                                onClick={() => handleDeleteMessage(msg)}
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
