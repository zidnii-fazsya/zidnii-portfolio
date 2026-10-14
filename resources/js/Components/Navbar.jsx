// resources/js/Components/Navbar.jsx

import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Navbar({ title = 'Dashboard', icon: Icon = LayoutDashboard }) {

    // Format tanggal otomatis
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <header className="h-[78px] bg-[#561e24] text-white px-8 flex justify-between items-center">

            {/* Ikon & judul halaman */}
            <div className="flex items-center gap-3 text-2xl font-semibold capitalize">
                {Icon && <Icon size={30} strokeWidth={1.75} />}
                <span>{title}</span>
            </div>

            {/* Tanggal */}
            <time className="text-sm font-bold whitespace-nowrap">
                {today}
            </time>

        </header>
    );
}