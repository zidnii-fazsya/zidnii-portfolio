// resources/js/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';

import {
    FileUser,
    BarChart2,
    Briefcase,
    MessageCircle,
    Eye,
    BarChart3,
    PieChart,
    Loader2,
} from 'lucide-react';

import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';
import ProfileModal from '../Components/ProfileModal';

import '../../css/dashboard.css';


/*
|--------------------------------------------------------------------------
| WARNA DONUT CHART
|--------------------------------------------------------------------------
*/

const DONUT_COLORS = [
    '#7c3aed',
    '#06b6d4',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#3b82f6',
];


function Dashboard() {


    /*
    |--------------------------------------------------------------------------
    | STATE DASHBOARD
    |--------------------------------------------------------------------------
    */

    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | STATE PROFILE MODAL
    |--------------------------------------------------------------------------
    */

    const [profileModalOpen, setProfileModalOpen] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | FETCH DASHBOARD DATA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchStats();
    }, []);


    const fetchStats = async () => {

        try {

            setLoading(true);
            setError(null);

            const res = await fetch(
                '/api/dashboard/stats',
                {
                    headers: {
                        'X-Requested-With':
                            'XMLHttpRequest',
                    },

                    credentials: 'same-origin',
                }
            );


            if (!res.ok) {

                throw new Error(
                    `HTTP ${res.status}`
                );

            }


            const data = await res.json();

            setStats(data);


        } catch (err) {

            console.error(
                'Gagal mengambil statistik dashboard:',
                err
            );

            setError(
                'Gagal memuat data. Silakan refresh halaman.'
            );


        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | COMPUTED VALUES
    |--------------------------------------------------------------------------
    */

    const totalProjects =
        stats?.total_projects ?? 0;


    const totalSkills =
        stats?.total_skills ?? 0;


    const totalExperiences =
        stats?.total_experiences ?? 0;


    const totalMessages =
        stats?.total_messages ?? 0;


    const totalVisitors =
        stats?.total_visitors ?? 0;


    const projectCategories =
        stats?.project_categories ?? [];


    const hasProjectCategories =
        projectCategories.length > 0;


    /*
    |--------------------------------------------------------------------------
    | HITUNG TOTAL PROJECT CATEGORY
    |--------------------------------------------------------------------------
    */

    const totalCatCount =
        projectCategories.reduce(
            (sum, c) => sum + c.total,
            0
        );


    /*
    |--------------------------------------------------------------------------
    | DONUT GRADIENT
    |--------------------------------------------------------------------------
    */

    let donutGradient = '';


    if (hasProjectCategories) {

        let accumulated = 0;


        const parts =
            projectCategories.map(
                (cat, idx) => {

                    const pct =
                        (cat.total /
                            totalCatCount) *
                        100;


                    const color =
                        DONUT_COLORS[
                            idx %
                            DONUT_COLORS.length
                        ];


                    const start =
                        accumulated;


                    const end =
                        accumulated + pct;


                    accumulated = end;


                    return (
                        `${color} ` +
                        `${start.toFixed(2)}% ` +
                        `${end.toFixed(2)}%`
                    );

                }
            );


        donutGradient =
            `conic-gradient(${parts.join(', ')})`;

    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="dashboard-page">


            {/* =====================================
                SIDEBAR
            ====================================== */}

            <Sidebar />


            {/* =====================================
                MAIN CONTENT
            ====================================== */}

            <div className="dashboard-main">


                {/* =====================================
                    NAVBAR
                ====================================== */}

                <Navbar
                    title="Dashboard"
                />


                {/* =====================================
                    DASHBOARD BODY
                ====================================== */}

                <main className="dashboard-content">


                    {/* =================================
                        WELCOME
                    ================================= */}

                    <section className="welcome-section">

                        <div>

                            <h1>
                                Welcome back! 👋
                            </h1>

                            <p>
                                Here's what's happening with your portfolio today.
                            </p>

                        </div>

                    </section>


                    {/* =================================
                        PROFILE MANAGEMENT
                    ================================= */}

                    <section className="dashboard-profile-section">

                        <div className="dashboard-profile-info">

                            <div>

                                <h2>
                                    Profile
                                </h2>

                                <p>
                                    Kelola informasi profil yang akan ditampilkan pada halaman visitor.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="dashboard-profile-button"
                                onClick={() =>
                                    setProfileModalOpen(true)
                                }
                            >
                                Kelola Profil
                            </button>

                        </div>

                    </section>


                    {/* =================================
                        ERROR
                    ================================= */}

                    {error && (

                        <div className="dashboard-error">

                            {error}

                        </div>

                    )}


                    {/* =================================
                        STATISTICS
                    ================================= */}

                    <section className="statistics-grid">


                        {/* =================================
                            TOTAL PROJECTS
                        ================================= */}

                        <div className="stat-card">

                            <div className="stat-icon">

                                <FileUser
                                    size={21}
                                    strokeWidth={1.8}
                                />

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Projects
                                </span>


                                <h2>

                                    {loading ? (

                                        <Loader2
                                            size={18}
                                            className="spin-icon"
                                        />

                                    ) : (

                                        totalProjects

                                    )}

                                </h2>

                            </div>

                        </div>


                        {/* =================================
                            TOTAL SKILLS
                        ================================= */}

                        <div className="stat-card">

                            <div className="stat-icon">

                                <BarChart2
                                    size={21}
                                    strokeWidth={1.8}
                                />

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Skills
                                </span>


                                <h2>

                                    {loading ? (

                                        <Loader2
                                            size={18}
                                            className="spin-icon"
                                        />

                                    ) : (

                                        totalSkills

                                    )}

                                </h2>

                            </div>

                        </div>


                        {/* =================================
                            TOTAL EXPERIENCES
                        ================================= */}

                        <div className="stat-card">

                            <div className="stat-icon">

                                <Briefcase
                                    size={21}
                                    strokeWidth={1.8}
                                />

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Experiences
                                </span>


                                <h2>

                                    {loading ? (

                                        <Loader2
                                            size={18}
                                            className="spin-icon"
                                        />

                                    ) : (

                                        totalExperiences

                                    )}

                                </h2>

                            </div>

                        </div>


                        {/* =================================
                            TOTAL MESSAGES
                        ================================= */}

                        <div className="stat-card">

                            <div className="stat-icon">

                                <MessageCircle
                                    size={21}
                                    strokeWidth={1.8}
                                />

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Messages
                                </span>


                                <h2>

                                    {loading ? (

                                        <Loader2
                                            size={18}
                                            className="spin-icon"
                                        />

                                    ) : (

                                        totalMessages

                                    )}

                                </h2>

                            </div>

                        </div>


                        {/* =================================
                            TOTAL VISITORS
                        ================================= */}

                        <div className="stat-card">

                            <div className="stat-icon">

                                <Eye
                                    size={21}
                                    strokeWidth={1.8}
                                />

                            </div>


                            <div className="stat-info">

                                <span>
                                    Total Visitors
                                </span>


                                <h2>

                                    {loading ? (

                                        <Loader2
                                            size={18}
                                            className="spin-icon"
                                        />

                                    ) : (

                                        totalVisitors

                                    )}

                                </h2>

                            </div>

                        </div>


                    </section>


                    {/* =================================
                        DASHBOARD CHARTS
                    ================================= */}

                    <section className="dashboard-charts">


                        {/* =================================
                            VISITOR STATISTICS
                        ================================= */}

                        <div className="chart-card">


                            {/* HEADER */}

                            <div className="chart-header">

                                <div>

                                    <h2>
                                        Visitor Statistics
                                    </h2>

                                    <p>
                                        Portfolio visitors statistics
                                    </p>

                                </div>


                                <div className="chart-period">
                                    This Week
                                </div>

                            </div>


                            {/* VISITOR CHART */}

                            {totalVisitors > 0 ? (

                                <div className="visitor-chart">

                                    <div className="chart-placeholder">
                                        Visitor chart
                                    </div>

                                </div>

                            ) : (

                                <div className="chart-empty">

                                    <div className="chart-empty-icon">

                                        <BarChart3
                                            size={28}
                                            strokeWidth={1.6}
                                        />

                                    </div>


                                    <h3>
                                        Belum Ada Data Visitor
                                    </h3>


                                    <p>
                                        Statistik visitor akan muncul
                                        setelah website mulai mendapatkan
                                        pengunjung.
                                    </p>

                                </div>

                            )}


                        </div>


                        {/* =================================
                            PROJECT CATEGORIES
                        ================================= */}

                        <div className="chart-card project-category-card">


                            {/* HEADER */}

                            <div className="chart-header">

                                <div>

                                    <h2>
                                        Project Categories
                                    </h2>

                                    <p>
                                        Distribution of your projects
                                    </p>

                                </div>

                            </div>


                            {/* PROJECT CATEGORY CHART */}

                            {hasProjectCategories ? (

                                <div className="donut-container">


                                    {/* DONUT */}

                                    <div
                                        className="donut-chart"
                                        style={{
                                            background:
                                                donutGradient
                                        }}
                                    >

                                        <div className="donut-hole">

                                            <strong>
                                                {totalCatCount}
                                            </strong>

                                            <span>
                                                Projects
                                            </span>

                                        </div>

                                    </div>


                                    {/* LEGEND */}

                                    <div className="donut-legend">

                                        {projectCategories.map(
                                            (cat, idx) => (

                                                <div
                                                    key={
                                                        cat.category
                                                    }
                                                    className="donut-legend-item"
                                                >

                                                    <span
                                                        className="donut-legend-dot"
                                                        style={{
                                                            background:
                                                                DONUT_COLORS[
                                                                    idx %
                                                                    DONUT_COLORS.length
                                                                ]
                                                        }}
                                                    />


                                                    <span className="donut-legend-label">

                                                        {cat.category}

                                                    </span>


                                                    <span className="donut-legend-count">

                                                        {cat.total}

                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>


                                </div>

                            ) : (

                                <div className="chart-empty">

                                    <div className="chart-empty-icon">

                                        <PieChart
                                            size={28}
                                            strokeWidth={1.6}
                                        />

                                    </div>


                                    <h3>
                                        Belum Ada Project
                                    </h3>


                                    <p>
                                        Kategori project akan muncul
                                        setelah kamu menambahkan project.
                                    </p>

                                </div>

                            )}


                        </div>


                    </section>


                </main>


            </div>


            {/* =====================================
                PROFILE MODAL
            ====================================== */}

            <ProfileModal
                isOpen={profileModalOpen}
                onClose={() =>
                    setProfileModalOpen(false)
                }
            />


        </div>

    );
}


export default Dashboard;