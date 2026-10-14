// resources/js/Components/Sidebar.jsx

import React from 'react';

import {
    LayoutDashboard,
    FileText,
    Briefcase,
    GraduationCap,
    MessageCircle,
    FileUser,
    BarChart2,
    UserPlus,
    Settings,
    LogOut
} from 'lucide-react';

import '../../css/sidebar.css';


export default function Sidebar({
    user = {
        name: "Zidnii Lu'lu Fazsya",
        avatar: '/image/me.jpeg'
    }
}) {

    // URL halaman yang sedang dibuka
    const currentPath = window.location.pathname;

    // Menu sidebar
    const menuItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard
        },
        {
            name: 'CV',
            href: '/cv',
            icon: FileText
        },
        {
            name: 'Experience',
            href: '/experience',
            icon: Briefcase
        },
        {
            name: 'Education',
            href: '/education',
            icon: GraduationCap
        },
        {
            name: 'Message',
            href: '/messages',
            icon: MessageCircle
        },
        {
            name: 'Project',
            href: '/projects',
            icon: FileUser
        },
        {
            name: 'Skills',
            href: '/skills',
            icon: BarChart2
        },
        {
            name: 'Social Media',
            href: '/social-media',
            icon: UserPlus
        },
        {
            name: 'Setting',
            href: '/settings',
            icon: Settings
        }
    ];


    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = async () => {

        try {

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });

            window.location.href = '/';

        } catch (error) {

            console.error('Logout gagal:', error);

        }

    };


    return (

        <aside className="sidebar">


            {/* =====================================
                PROFILE
            ====================================== */}

            <div className="sidebar-profile">

                {/* Foto */}

                <img
                    src={user.avatar}
                    alt={user.name}
                    className="sidebar-avatar"
                />

                {/* Nama */}

                <div className="sidebar-user-info">

                    <h2 className="sidebar-user-name">
                        {user.name}
                    </h2>

                    <p className="sidebar-user-role">
                        Administrator
                    </p>

                </div>

            </div>


            {/* =====================================
                NAVIGATION
            ====================================== */}

            <nav className="sidebar-nav">

                <ul className="sidebar-menu">

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        const isActive =
                            currentPath === item.href ||
                            currentPath.startsWith(item.href + '/');

                        return (

                            <li key={item.name}>

                                <a
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`sidebar-menu-item${isActive ? ' active' : ''}`}
                                >

                                    {/* Icon */}

                                    <Icon
                                        size={20}
                                        strokeWidth={1.8}
                                        className="sidebar-menu-icon"
                                    />

                                    {/* Nama Menu */}

                                    <span className="sidebar-menu-label">
                                        {item.name}
                                    </span>

                                </a>

                            </li>

                        );

                    })}

                </ul>

            </nav>


            {/* =====================================
                LOGOUT
            ====================================== */}

            <div className="sidebar-footer">

                <button
                    type="button"
                    onClick={handleLogout}
                    className="sidebar-logout-btn"
                >

                    <LogOut
                        size={20}
                        strokeWidth={1.8}
                        className="sidebar-menu-icon"
                    />

                    <span className="sidebar-menu-label">
                        Logout
                    </span>

                </button>

            </div>

        </aside>

    );
}
