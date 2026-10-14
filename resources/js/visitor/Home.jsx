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
import Contact from './Contact';

import useLanguage from '../utils/useLanguage';

/*
|--------------------------------------------------------------------------
| DESKRIPSI HERO (TETAP)
|--------------------------------------------------------------------------
| Kalimat ini tidak lagi diambil dari portal admin.
| Untuk mengubahnya, edit teks di bawah ini.
*/

const HERO_DESCRIPTION_ID =
    'Lulusan Sistem Informasi yang memiliki pengalaman dalam pengembangan web (Fullstack Web Developer), desain UI/UX, dan analisis sistem. Memiliki semangat untuk menciptakan aplikasi web yang fungsional dan mudah digunakan serta berkontribusi dalam koordinasi proyek IT yang efektif.';

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

        if (value.includes('whatsapp')) {
            return '/image/wa.jpeg';
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
                                href="#contact"
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

                        {socialMedia.length > 0 && (
                            <div className="visitor-hero-socials">
                                <p className="visitor-socials-label">
                                    {isEnglish
                                        ? 'Find me on'
                                        : 'Temukan saya di'}
                                </p>

                                <div className="visitor-socials-list">
                                    {socialMedia.map((item, index) => {
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
                                                    item.id ??
                                                    `${platform}-${index}`
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
                            <div
                                className={[
                                    'visitor-hero-photo-card',
                                    isFlipped
                                        ? 'is-flipped'
                                        : '',
                                ].filter(Boolean).join(' ')}
                                style={{
                                    transform: isFlipped
                                        ? 'rotateY(180deg)'
                                        : 'rotateY(0deg)',
                                    transition:
                                        'transform 1s ease-in-out',
                                }}
                            >
                                {/* FOTO DEPAN */}

                                <div className="visitor-hero-photo-face visitor-hero-photo-front">
                                    <img
                                        src="/image/me.jpeg"
                                        alt={displayName}
                                        loading="eager"
                                        onError={(event) => {
                                            console.error(
                                                'Foto me.jpeg gagal dimuat:',
                                                event.currentTarget.src
                                            );
                                        }}
                                    />
                                </div>

                                {/* FOTO BELAKANG */}

                                <div className="visitor-hero-photo-face visitor-hero-photo-back">
                                    <img
                                        src="/image/mee.jpeg"
                                        alt={`${displayName} - foto kedua`}
                                        loading="eager"
                                        onError={(event) => {
                                            console.error(
                                                'Foto mee.jpeg gagal dimuat:',
                                                event.currentTarget.src
                                            );
                                        }}
                                    />
                                </div>
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

                {/* CONTACT */}

                <Contact />
            </main>
        </div>
    );
};

export default Home;