import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

import '../../css/visitor-home.css';

import VisitorNavbar from '../Components/VisitorNavbar';
import MoltenMetal from './Components/MoltenMetal';
import About from './About';
import Experience from './Experience';
import VisitorEducation from './Education';
import VisitorSkills from './Skills';
import Projects from './Projects';

import useLanguage from '../utils/useLanguage';

/*
|--------------------------------------------------------------------------
| DESKRIPSI HERO (TETAP)
|--------------------------------------------------------------------------
| Kalimat ini tidak lagi diambil dari portal admin.
| Untuk mengubahnya, edit teks di bawah ini.
*/

const HERO_DESCRIPTION_ID =
    'Lulusan D3 Sistem Informasi Telkom University dengan IPK 3,54 dan pengalaman dalam pengembangan aplikasi web, desain UI/UX, serta analisis sistem. Memiliki minat pada Web Development, System Analysis, dan IT Project Management, dengan ketertarikan dalam membangun solusi digital yang fungsional dan berorientasi pada kebutuhan pengguna, sekaligus mendukung perencanaan dan koordinasi proyek IT secara efektif.';

const HERO_DESCRIPTION_EN =
    'Information Systems graduate with experience in web development (Fullstack Web Developer), UI/UX design, and system analysis. Passionate about building functional, easy-to-use web applications and contributing to effective IT project coordination.';

const Home = () => {
    const languageContext = useLanguage();
    const language = languageContext?.language || 'id';
    const isEnglish = language === 'en';

    const [profile, setProfile] = useState(null);
    const [socialMedia, setSocialMedia] = useState([]);
    const [cv, setCv] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | TRANSISI FOTO CARD
    |--------------------------------------------------------------------------
    | Foto depan  : /image/me.jpeg
    | Foto belakang: /image/mee.jpeg
    | Pergantian otomatis setiap 3 detik.
    */

    useEffect(() => {
        const interval = window.setInterval(() => {
            setIsFlipped((previous) => !previous);
        }, 3000);

        return () => window.clearInterval(interval);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | AMBIL DATA PROFIL, SOSIAL MEDIA, DAN CV
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const fetchHomeData = async () => {
            try {
                const [
                    profileResponse,
                    socialResponse,
                    cvResponse,
                ] = await Promise.all([
                    fetch('/api/profile', {
                        signal: controller.signal,
                        headers: { Accept: 'application/json' },
                    }),
                    fetch('/api/social-media', {
                        signal: controller.signal,
                        headers: { Accept: 'application/json' },
                    }),
                    fetch('/api/cv', {
                        signal: controller.signal,
                        headers: { Accept: 'application/json' },
                    }),
                ]);

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();

                    setProfile(
                        profileData.profile ??
                        profileData.data ??
                        profileData
                    );
                }

                if (socialResponse.ok) {
                    const socialData = await socialResponse.json();

                    const items = Array.isArray(socialData)
                        ? socialData
                        : socialData.social_media ??
                          socialData.socialMedia ??
                          socialData.data ??
                          [];

                    setSocialMedia(Array.isArray(items) ? items : []);
                }

                if (cvResponse.ok) {
                    const cvData = await cvResponse.json();

                    setCv(
                        cvData.cv ??
                        cvData.data ??
                        cvData
                    );
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error(
                        'Gagal mengambil data halaman Home:',
                        error
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setProfileLoading(false);
                }
            }
        };

        fetchHomeData();

        return () => controller.abort();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | URL CV
    |--------------------------------------------------------------------------
    */

    const getCvUrl = () => {
        if (!cv) return null;

        const file =
            cv.file_url ||
            cv.cv_url ||
            cv.file_path ||
            cv.path ||
            cv.url;

        if (!file) return null;

        if (/^(https?:\/\/|\/)/i.test(file)) {
            return file;
        }

        return `/storage/${String(file).replace(/^\/+/, '')}`;
    };

    /*
    |--------------------------------------------------------------------------
    | IKON MEDIA SOSIAL DARI FOLDER PUBLIC
    |--------------------------------------------------------------------------
    | LinkedIn : public/image/link.webp
    | Instagram: public/image/ig.webp
    | WhatsApp : public/image/wa.jpeg
    */

    const getSocialImage = (platform) => {
        const value = String(platform || '').toLowerCase();

        if (value.includes('linkedin')) {
            return '/image/link.webp';
        }

        if (value.includes('instagram')) {
            return '/image/ig.webp';
        }

        if (value.includes('whatsapp') || value.includes('wa')) {
            return '/image/wa.jpeg';
        }

        if (value.includes('gmail') || value.includes('email') || value.includes('mail')) {
            return '/image/gmail.png';
        }

        return null;
    };

    const getSocialIcon = (platform) => {
        const value = String(platform || '').toLowerCase();

        if (value.includes('github')) {
            return Icons.Code2;
        }

        if (value.includes('facebook')) {
            return Icons.Users;
        }

        if (value.includes('youtube')) {
            return Icons.CirclePlay;
        }

        if (value.includes('email') || value.includes('mail')) {
            return Icons.Mail;
        }

        return Icons.ExternalLink;
    };

    const getSocialUrl = (item) => {
        const platform = String(item?.platform || item?.name || '').toLowerCase();
        if (platform.includes('gmail') || platform.includes('mail')) {
            return (
                item.url ||
                item.link ||
                'https://mail.google.com/mail/?view=cm&fs=1&to=zidniilulufazsya@gmail.com'
            );
        }

        return (
            item.url ||
            item.link ||
            item.social_url ||
            item.profile_url ||
            ''
        );
    };

    /*
    |--------------------------------------------------------------------------
    | GMAIL & SOCIAL MEDIA LIST RESOLUTION
    |--------------------------------------------------------------------------
    */

    const displaySocialMedia = React.useMemo(() => {
        const items = [...socialMedia];
        const hasGmail = items.some((item) => {
            const val = String(item.platform || item.name || '').toLowerCase();
            return val.includes('gmail') || val.includes('mail');
        });

        if (!hasGmail) {
            const waIndex = items.findIndex((item) => {
                const val = String(item.platform || item.name || '').toLowerCase();
                return val.includes('whatsapp') || val.includes('wa');
            });

            const gmailItem = {
                id: 'direct-gmail',
                platform: 'Gmail',
                name: 'Gmail',
                url: 'https://mail.google.com/mail/?view=cm&fs=1&to=zidniilulufazsya@gmail.com',
            };

            if (waIndex !== -1) {
                items.splice(waIndex + 1, 0, gmailItem);
            } else {
                items.push(gmailItem);
            }
        }

        return items;
    }, [socialMedia]);

    /*
    |--------------------------------------------------------------------------
    | DATA TAMPILAN
    |--------------------------------------------------------------------------
    | Nama dan headline masih dari portal admin.
    | Deskripsi hero memakai kalimat tetap (lihat konstanta di atas).
    */

    const displayName =
        profile?.name ||
        profile?.full_name ||
        "Zidnii Lu'lu Fazsya";

    const headline =
        profile?.headline ||
        profile?.position ||
        profile?.job_title ||
        'Web Developer & IT Project Management Enthusiast';

    const heroDescription = isEnglish
        ? HERO_DESCRIPTION_EN
        : HERO_DESCRIPTION_ID;

    const cvUrl = getCvUrl();

    return (
        <div className="visitor-home">
            {/* BACKGROUND MOLTEN METAL MAROON */}

            <div
                className="visitor-global-molten"
                aria-hidden="true"
            >
                <MoltenMetal
                    color1="#3D141E"
                    color2="#561C24"
                    color3="#F3E8EA"
                    speed={0.35}
                    scale={4}
                    detail={3}
                    glow={1.6}
                    coreSize={0.1}
                    swirl={1}
                    fold={-0.2}
                    blackPoint={0.05}
                    brightness={1.3}
                    colorMode="molten"
                    grain={true}
                    mouseInteraction={true}
                    opacity={1}
                    backgroundColor="#080506"
                    lightMode={false}
                />
            </div>

            {/* NAVBAR */}

            <VisitorNavbar />

            <main className="visitor-page-content">
                {/* HOME / HERO */}

                <section
                    id="home"
                    className="visitor-hero"
                >
                    <div className="visitor-hero-content">
                        <p className="visitor-greeting">
                            {isEnglish ? 'Hello, I am' : 'Halo, saya'}
                        </p>

                        <h1>{displayName}</h1>

                        <h2>{headline}</h2>

                        <p className="visitor-hero-description">
                            {heroDescription}
                        </p>

                        <div className="visitor-hero-actions">
                            <a
                                href="#projects"
                                className="visitor-primary-button"
                            >
                                {isEnglish
                                    ? 'View Projects'
                                    : 'Lihat Project'}
                            </a>

                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=zidniilulufazsya@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="visitor-secondary-button"
                            >
                                {isEnglish
                                    ? 'Contact Me'
                                    : 'Hubungi Saya'}
                            </a>

                            {cvUrl ? (
                                <a
                                    href={cvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="visitor-cv-button"
                                >
                                    <Icons.Download size={17} />

                                    {isEnglish
                                        ? 'Download CV'
                                        : 'Unduh CV'}
                                </a>
                            ) : (
                                <span
                                    className="visitor-cv-button is-unavailable"
                                    aria-disabled="true"
                                    title={
                                        isEnglish
                                            ? 'CV is not available'
                                            : 'CV belum tersedia'
                                    }
                                >
                                    <Icons.Download size={17} />

                                    {isEnglish
                                        ? 'CV Unavailable'
                                        : 'CV Belum Tersedia'}
                                </span>
                            )}
                        </div>

                        {/* SOCIAL MEDIA */}

                        {displaySocialMedia.length > 0 && (
                            <div className="visitor-hero-socials">
                                <p className="visitor-socials-label">
                                    {isEnglish
                                        ? 'Find me on'
                                        : 'Temukan saya di'}
                                </p>

                                <div className="visitor-socials-list">
                                    {displaySocialMedia.map((item, index) => {
                                        const platform =
                                            item.platform ||
                                            item.name ||
                                            item.title ||
                                            'Social media';

                                        const url = getSocialUrl(item);

                                        if (!url) return null;

                                        const image =
                                            getSocialImage(platform);

                                        const Icon =
                                            getSocialIcon(platform);

                                        return (
                                            <a
                                                key={
                                                    (item.id !== null && item.id !== undefined && item.id !== false)
                                                        ? String(item.id)
                                                        : `${platform}-${index}`
                                                }
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={platform}
                                                title={platform}
                                                className="visitor-social-link"
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        aria-hidden="true"
                                                        className="visitor-social-image"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            if (!e.currentTarget.dataset.retried && String(platform).toLowerCase().includes('gmail')) {
                                                                e.currentTarget.dataset.retried = 'true';
                                                                e.currentTarget.src = '/image/gmail.png';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Icon size={20} />
                                                )}

                                                <span className="visitor-social-tooltip">
                                                    {platform}
                                                </span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PROFILE CARD DENGAN DUA FOTO */}

                    <div className="visitor-hero-photo-wrapper">
                        <div className="visitor-hero-photo-scene">
                            {/* FOTO DEPAN */}

                            <div
                                className="visitor-hero-photo-face visitor-hero-photo-front"
                                style={{ opacity: isFlipped ? 0 : 1 }}
                            >
                                <img
                                    src="/image/me.jpeg"
                                    alt={displayName}
                                    loading="eager"
                                    decoding="async"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>

                            {/* FOTO BELAKANG */}

                            <div
                                className="visitor-hero-photo-face visitor-hero-photo-back"
                                style={{ opacity: isFlipped ? 1 : 0 }}
                            >
                                <img
                                    src="/image/meee.jpeg"
                                    alt={`${displayName} - foto kedua`}
                                    loading="eager"
                                    decoding="async"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* NAMA DAN GELAR */}

                        <div className="visitor-hero-photo-caption">
                            <p className="visitor-hero-photo-name">
                                {displayName} A.Md.Kom.
                            </p>

                            <p className="visitor-hero-photo-degree">
                                {isEnglish
                                    ? 'INFORMATION SYSTEMS'
                                    : 'SISTEM INFORMASI'}
                            </p>
                        </div>
                    </div>

                    {profileLoading && (
                        <p className="visitor-profile-notice">
                            {isEnglish
                                ? 'Loading profile...'
                                : 'Memuat profil...'}
                        </p>
                    )}
                </section>

                {/* ABOUT */}

                <About />

                {/* EXPERIENCE */}

                <Experience />

                {/* EDUCATION */}

                <section
                    id="education"
                    className="visitor-education-section"
                >
                    <VisitorEducation />
                </section>

                {/* SKILLS */}

                <section
                    id="skills"
                    className="visitor-skills-section"
                >
                    <VisitorSkills />
                </section>

                {/* PROJECTS */}

                <Projects />
            </main>
        </div>
    );
};

export default Home;