
import React, { useEffect, useMemo, useState } from 'react';
import { Zap } from 'lucide-react';

import '../../css/visitor-skills.css';
import useLanguage from '../utils/useLanguage';

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const MIN_CARDS_PER_GROUP = 8;
const SECONDS_PER_CARD = 5;

/*
|--------------------------------------------------------------------------
| NORMALIZE SKILL LOGO URL
|--------------------------------------------------------------------------
| Menangani beberapa kemungkinan format URL dari Laravel API:
| - skills/logo.png
| - storage/skills/logo.png
| - /storage/skills/logo.png
| - public/storage/skills/logo.png
| - https://domain.com/storage/skills/logo.png
*/

const getLogoUrl = (rawLogo) => {
    if (!rawLogo || typeof rawLogo !== 'string') {
        return null;
    }

    const logo = rawLogo.trim();

    if (!logo) {
        return null;
    }

    // Data URL dan Blob URL tidak perlu diubah.
    if (/^(data:|blob:)/i.test(logo)) {
        return logo;
    }

    // URL lengkap.
    if (/^https?:\/\//i.test(logo)) {
        try {
            const parsedUrl = new URL(logo);

            const pathname = decodeURIComponent(parsedUrl.pathname);

            // Jika URL mengarah ke Laravel public storage,
            // gunakan path yang sama pada domain Netlify.
            if (
                pathname === '/storage' ||
                pathname.startsWith('/storage/')
            ) {
                return `${pathname}${parsedUrl.search}${parsedUrl.hash}`;
            }

            if (pathname.startsWith('/public/storage/')) {
                return `${pathname.replace('/public/storage/', '/storage/')}${parsedUrl.search}${parsedUrl.hash}`;
            }

            return logo;
        } catch {
            return logo;
        }
    }

    // Hilangkan slash di awal agar path konsisten.
    let cleanPath = logo.replace(/\\/g, '/').replace(/^\/+/, '');

    // Jika path berasal dari public/storage.
    cleanPath = cleanPath.replace(/^public\/storage\//i, '');

    // Jika path sudah mengandung storage/.
    cleanPath = cleanPath.replace(/^storage\//i, '');

    // Jika hanya nama file atau folder skills/.
    return `/storage/${cleanPath}`;
};

/*
|--------------------------------------------------------------------------
| GET SKILL LOGO
|--------------------------------------------------------------------------
| Mendukung logo berbentuk string maupun object.
*/

const extractLogo = (skill) => {
    if (!skill) {
        return null;
    }

    const logo = skill.logo;

    if (typeof logo === 'string') {
        return getLogoUrl(logo);
    }

    if (logo && typeof logo === 'object') {
        const logoPath =
            logo.url ||
            logo.src ||
            logo.path ||
            logo.file_path ||
            logo.image_path;

        return getLogoUrl(logoPath);
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function VisitorSkills() {
    const { t } = useLanguage();

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /*
    |--------------------------------------------------------------------------
    | FETCH SKILLS FROM LARAVEL API
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        async function fetchSkills() {
            try {
                setLoading(true);
                setError('');

                const response = await fetch('/api/public/skills', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Gagal mengambil data skills. Status: ${response.status}`
                    );
                }

                const data = await response.json();

                const skillData = Array.isArray(data)
                    ? data
                    : Array.isArray(data.skills)
                        ? data.skills
                        : [];

                setSkills(skillData);

            } catch (err) {
                if (err.name === 'AbortError') {
                    return;
                }

                console.error('Skills API Error:', err);

                setError(
                    err.message ||
                    'Terjadi kesalahan saat mengambil data skills.'
                );

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchSkills();

        return () => controller.abort();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SPLIT ALL SKILLS INTO 2 ROWS
    |--------------------------------------------------------------------------
    */

    const rows = useMemo(() => {
        if (skills.length === 0) {
            return [];
        }

        if (skills.length === 1) {
            return [skills];
        }

        const half = Math.ceil(skills.length / 2);

        return [
            skills.slice(0, half),
            skills.slice(half),
        ];
    }, [skills]);

    /*
    |--------------------------------------------------------------------------
    | RENDER SKILL CARD
    |--------------------------------------------------------------------------
    */

    const renderSkillCard = (skill, key) => {
        const logoUrl = extractLogo(skill);

        const level = String(
            skill.level || 'Beginner'
        )
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-');

        const skillName = skill.skill_name || 'Skill';

        return (
            <article className="skill-card" key={key}>
                {/* SKILL LOGO */}

                <div className="skill-card-logo">
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt={`${skillName} logo`}
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';

                                const fallback =
                                    event.currentTarget.parentElement
                                        ?.querySelector(
                                            '.skill-card-fallback'
                                        );

                                if (fallback) {
                                    fallback.style.display = 'flex';
                                }

                                console.error(
                                    'Gagal memuat logo skill:',
                                    logoUrl
                                );
                            }}
                        />
                    )}

                    <span
                        className="skill-card-fallback"
                        style={{
                            display: logoUrl ? 'none' : 'flex',
                        }}
                        aria-hidden="true"
                    >
                        {skillName.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>

                {/* SKILL NAME AND LEVEL */}

                <div className="skill-card-body">
                    <h4>{skillName}</h4>

                    {skill.level && (
                        <span
                            className={`skill-card-level skill-card-level-${level}`}
                        >
                            {skill.level}
                        </span>
                    )}
                </div>

                {/* TECHNOLOGY DESCRIPTION */}

                {skill.technology && (
                    <p className="skill-card-tech">
                        {skill.technology}
                    </p>
                )}
            </article>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER ONE MARQUEE ROW
    |--------------------------------------------------------------------------
    */

    const renderRow = (rowSkills, rowIndex) => {
        if (!rowSkills.length) {
            return null;
        }

        const repeat = Math.max(
            1,
            Math.ceil(MIN_CARDS_PER_GROUP / rowSkills.length)
        );

        const cardsPerGroup = rowSkills.length * repeat;
        const duration = cardsPerGroup * SECONDS_PER_CARD;
        const reverse = rowIndex % 2 === 1;

        const renderGroup = (groupIndex) => (
            <div
                className="skills-card-group"
                key={groupIndex}
                aria-hidden={groupIndex === 1 ? 'true' : undefined}
            >
                {Array.from({ length: repeat }).flatMap((_, copy) =>
                    rowSkills.map((skill, index) =>
                        renderSkillCard(
                            skill,
                            `${skill.id ?? skill.skill_name}-${groupIndex}-${copy}-${index}`
                        )
                    )
                )}
            </div>
        );

        return (
            <div className="skills-card-marquee" key={rowIndex}>
                <div
                    className={`skills-card-track ${
                        reverse ? 'skills-card-track-reverse' : ''
                    }`}
                    style={{
                        '--marquee-duration': `${duration}s`,
                    }}
                >
                    {renderGroup(0)}
                    {renderGroup(1)}
                </div>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER VISITOR SKILLS
    |--------------------------------------------------------------------------
    */

    return (
        <main className="visitor-skills">

            {/* SECTION HEADER */}

            <section className="skills-hero">
                <span className="skills-eyebrow">
                    {t.skills.eyebrow}
                </span>

                <h1>
                    {t.skills.title}
                </h1>

                <p>
                    {t.skills.subtitle}
                </p>
            </section>

            {/* SKILLS CONTENT */}

            <section className="skills-content">

                {/* LOADING */}

                {loading && (
                    <p
                        className="skills-status"
                        role="status"
                    >
                        {t.skills.loading}
                    </p>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div
                        className="skills-status skills-error"
                        role="alert"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            className="skills-retry-button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY STATE */}

                {!loading && !error && skills.length === 0 && (
                    <div className="skills-empty">
                        <Zap size={35} />

                        <h3>{t.skills.empty}</h3>
                    </div>
                )}

                {/* ALL SKILLS IN 2 ROWS */}

                {!loading && !error && skills.length > 0 && (
                    <div className="skills-rows">
                        {rows.map((rowSkills, rowIndex) =>
                            renderRow(rowSkills, rowIndex)
                        )}
                    </div>
                )}

            </section>
        </main>
    );
}
