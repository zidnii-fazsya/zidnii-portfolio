
import React, { useState } from 'react';
import {
    Mail,
    Send,
    LoaderCircle,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

import '../../css/visitor-contact.css';
import useLanguage from '../utils/useLanguage';

export default function Contact() {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [loading, setLoading] = useState(false);

    const [feedback, setFeedback] = useState({
        type: '',
        text: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setFeedback({ type: '', text: '' });

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            if (!csrfToken) {
                throw new Error(
                    'Token keamanan tidak ditemukan. Periksa meta CSRF pada layout Blade.'
                );
            }

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify(form),
            });

            // Hindari error JSON.parse jika server mengembalikan HTML.
            const responseText = await response.text();

            let result = {};

            try {
                result = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                result = {};
            }

            if (!response.ok) {
                if (response.status === 419) {
                    throw new Error(
                        'Sesi keamanan telah berakhir. Muat ulang halaman, lalu coba kembali.'
                    );
                }

                if (response.status === 429) {
                    throw new Error(
                        'Terlalu banyak percobaan. Silakan tunggu sebentar.'
                    );
                }

                if (response.status === 422 && result.errors) {
                    const firstError = Object.values(result.errors)
                        .flat()[0];

                    throw new Error(
                        firstError || 'Periksa kembali data formulir.'
                    );
                }

                throw new Error(
                    result.message ||
                    `Pesan gagal dikirim. Kode respons: ${response.status}.`
                );
            }

            setForm({
                name: '',
                email: '',
                subject: '',
                message: '',
            });

            setFeedback({
                type: result.email_sent === true
                    ? 'success'
                    : 'warning',
                text: result.message || (
                    result.email_sent === true
                        ? 'Pesan berhasil dikirim.'
                        : 'Pesan berhasil diproses, tetapi status pengiriman email belum berhasil dikonfirmasi.'
                ),
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                text: error.message ||
                    'Terjadi kesalahan. Silakan coba kembali.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            id="contact"
            className="visitor-contact"
            aria-labelledby="visitor-contact-title"
        >
            <div className="visitor-contact__container">
                {/* CONTACT INTRODUCTION */}

                <div className="visitor-contact__intro">
                    <span className="visitor-contact__eyebrow">
                        {t.contact.eyebrow}
                    </span>

                    <h2 id="visitor-contact-title">
                        {t.contact.title} <span>{t.contact.titleSpan}</span>
                    </h2>

                    <p>
                        {t.contact.desc}
                    </p>

                    <div className="visitor-contact__email">
                        <span className="visitor-contact__email-icon">
                            <Mail size={21} aria-hidden="true" />
                        </span>

                        <div>
                            <small>{t.contact.emailLabel}</small>

                            <a href="mailto:zidniilulufazsya@gmail.com">
                                zidniilulufazsya@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* CONTACT FORM */}

                <form
                    className="visitor-contact__form"
                    onSubmit={handleSubmit}
                    aria-busy={loading}
                >
                    <div className="visitor-contact__field">
                        <label htmlFor="contact-name">
                            {t.contact.name}
                        </label>

                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            placeholder={t.contact.namePlaceholder}
                            value={form.name}
                            onChange={handleChange}
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="visitor-contact__field">
                        <label htmlFor="contact-email">
                            {t.contact.email}
                        </label>

                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            placeholder={t.contact.emailPlaceholder}
                            value={form.email}
                            onChange={handleChange}
                            maxLength={255}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="visitor-contact__field">
                        <label htmlFor="contact-subject">
                            {t.contact.subject} <span>{t.contact.optional}</span>
                        </label>

                        <input
                            id="contact-subject"
                            name="subject"
                            type="text"
                            placeholder={t.contact.subjectPlaceholder}
                            value={form.subject}
                            onChange={handleChange}
                            maxLength={255}
                        />
                    </div>

                    <div className="visitor-contact__field">
                        <label htmlFor="contact-message">
                            {t.contact.message}
                        </label>

                        <textarea
                            id="contact-message"
                            name="message"
                            placeholder={t.contact.messagePlaceholder}
                            value={form.message}
                            onChange={handleChange}
                            maxLength={5000}
                            rows={5}
                            required
                        />
                    </div>

                    {/* FEEDBACK */}

                    {feedback.text && (
                        <div
                            className={
                                `visitor-contact__feedback visitor-contact__feedback--${feedback.type}`
                            }
                            role="status"
                            aria-live="polite"
                        >
                            {feedback.type === 'success' ? (
                                <CheckCircle
                                    size={18}
                                    aria-hidden="true"
                                />
                            ) : (
                                <AlertCircle
                                    size={18}
                                    aria-hidden="true"
                                />
                            )}

                            <span>{feedback.text}</span>
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}

                    <button
                        className="visitor-contact__submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="visitor-contact__spinner"
                                    aria-hidden="true"
                                />

                                {t.contact.sending}
                            </>
                        ) : (
                            <>
                                {t.contact.send}

                                <Send
                                    size={17}
                                    aria-hidden="true"
                                />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}
