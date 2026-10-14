import React, { useEffect, useState } from 'react';
import {
    MessageCircle,
    ChevronLeft,
    AlertCircle,
    X
} from 'lucide-react';

import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';

import '../../css/message.css';

export default function MessageDetail({ id }) {
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alertMsg, setAlertMsg] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchMessage = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`/api/messages/${id}`, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    throw new Error('Gagal memuat pesan.');
                }

                const data = await res.json();
                setMsg(data.message);
            } catch (err) {
                setError(err.message || 'Terjadi kesalahan saat memuat pesan.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessage();
    }, [id]);

    const handleBack = () => {
        window.location.href = '/messages';
    };

    const handleMarkAsRead = async () => {
        try {
            setError('');
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const res = await fetch(`/api/messages/${id}/read`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal mengubah status.');

            setMsg((prev) => ({ ...prev, status: 'Read', is_read: true }));
            setAlertMsg('Pesan telah ditandai sebagai dibaca.');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReply = async () => {
        try {
            setError('');
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            await fetch(`/api/messages/${id}/reply`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            setMsg((prev) => ({ ...prev, status: 'Replied', is_read: true }));

            // Open mailto client with prefilled recipient and subject
            const email = msg?.email || '';
            const subject = encodeURIComponent(`Re: ${msg?.subject || 'Portfolio Message'}`);
            window.location.href = `mailto:${email}?subject=${subject}`;
        } catch (err) {
            setError(err.message);
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

    const navbarTitle = (
        <div className="flex items-center gap-2">
            <span>Message</span>
            <span className="text-white/70">&gt;</span>
            <span className="font-semibold">Massage Detail</span>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Navbar title={navbarTitle} icon={MessageCircle} />

                <main className="message-page">
                    {/* Header */}
                    <div className="message-page-header">
                        <div>
                            <h1>Message Detail</h1>
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

                    {loading ? (
                        <div className="message-card">
                            <div className="project-loading">
                                <div className="project-spinner"></div>
                                <span>Memuat detail pesan...</span>
                            </div>
                        </div>
                    ) : !msg ? (
                        <div className="message-card p-6 text-center text-gray-500">
                            Pesan tidak ditemukan.
                        </div>
                    ) : (
                        <div className="message-detail-card">
                            <div className="message-detail-table">
                                <div className="message-detail-row">
                                    <div className="message-detail-label">Email</div>
                                    <div className="message-detail-colon">:</div>
                                    <div className="message-detail-value underline font-semibold text-gray-900">
                                        {msg.email}
                                    </div>
                                </div>

                                <div className="message-detail-row">
                                    <div className="message-detail-label">Name</div>
                                    <div className="message-detail-colon">:</div>
                                    <div className="message-detail-value">{msg.name}</div>
                                </div>

                                <div className="message-detail-row">
                                    <div className="message-detail-label">Subject</div>
                                    <div className="message-detail-colon">:</div>
                                    <div className="message-detail-value font-medium">
                                        {msg.subject || '-'}
                                    </div>
                                </div>

                                <div className="message-detail-row">
                                    <div className="message-detail-label">Date</div>
                                    <div className="message-detail-colon">:</div>
                                    <div className="message-detail-value">
                                        {msg.created_at
                                            ? new Date(msg.created_at).toLocaleDateString('id-ID', {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  year: 'numeric',
                                              })
                                            : '-'}
                                    </div>
                                </div>

                                <div className="message-detail-row">
                                    <div className="message-detail-label">Status</div>
                                    <div className="message-detail-colon">:</div>
                                    <div className="message-detail-value">
                                        {getStatusBadge(msg.status)}
                                    </div>
                                </div>

                                <div className="message-detail-row flex-col">
                                    <div className="flex items-center">
                                        <div className="message-detail-label">Message</div>
                                        <div className="message-detail-colon">:</div>
                                    </div>
                                    <div className="message-detail-box">
                                        {msg.message}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="message-detail-actions">
                                <button
                                    type="button"
                                    className="message-btn-read"
                                    onClick={handleMarkAsRead}
                                >
                                    mark as read
                                </button>
                                <button
                                    type="button"
                                    className="message-btn-reply"
                                    onClick={handleReply}
                                >
                                    Replay Messages
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
