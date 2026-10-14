
import React from 'react';
import { createRoot } from 'react-dom/client';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CV from './pages/CV';
import Education from './pages/Education';
import SocialMedia from './pages/SocialMedia';
import Skills from './pages/Skill';
import AddSkill from './pages/AddSkill';
import Project from './pages/Project';
import AddProject from './pages/AddProject';
import Experience from './pages/Experience';
import Message from './pages/Message';
import MessageDetail from './pages/MessageDetail';
import Profile from './pages/Profile';

import Home from './visitor/Home';
import ErrorBoundary from './Components/ErrorBoundary';

import '../css/profile-modal.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
    const path = window.location.pathname;

    /*
    |--------------------------------------------------------------------------
    | VISITOR PORTFOLIO
    |--------------------------------------------------------------------------
    | Kedua URL menggunakan satu halaman portfolio yang sama.
    | Education ditampilkan sebagai section di dalam Home.
    */

    if (
        path === '/' ||
        path === '/visitor/education' ||
        path === '/visitor/contact' ||
        path === '/contact'
    ) {
        return <Home />;
    }

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    if (path === '/dashboard') {
        return <Dashboard />;
    }

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    if (path === '/profile') {
        return <Profile />;
    }

    /*
    |--------------------------------------------------------------------------
    | MESSAGES
    |--------------------------------------------------------------------------
    */

    if (path.startsWith('/messages/')) {
        const messageId = path.split('/')[2];

        return <MessageDetail id={messageId} />;
    }

    if (path === '/messages') {
        return <Message />;
    }

    /*
    |--------------------------------------------------------------------------
    | EXPERIENCE ADMIN
    |--------------------------------------------------------------------------
    */

    if (path === '/experience') {
        return <Experience />;
    }

    /*
    |--------------------------------------------------------------------------
    | CV ADMIN
    |--------------------------------------------------------------------------
    */

    if (path === '/cv') {
        return <CV />;
    }

    /*
    |--------------------------------------------------------------------------
    | EDUCATION ADMIN
    |--------------------------------------------------------------------------
    */

    if (path === '/education') {
        return <Education />;
    }

    /*
    |--------------------------------------------------------------------------
    | SOCIAL MEDIA ADMIN
    |--------------------------------------------------------------------------
    */

    if (path === '/social-media') {
        return <SocialMedia />;
    }

    /*
    |--------------------------------------------------------------------------
    | ADD SKILL
    |--------------------------------------------------------------------------
    */

    if (path === '/skills/add') {
        return <AddSkill />;
    }

    if (path.startsWith('/skills/edit/')) {
        const editId = path.split('/')[3];

        return <AddSkill editId={editId} />;
    }

    /*
    |--------------------------------------------------------------------------
    | SKILLS ADMIN
    |--------------------------------------------------------------------------
    */

    if (path === '/skills') {
        return <Skills />;
    }

    /*
    |--------------------------------------------------------------------------
    | ADD PROJECT
    |--------------------------------------------------------------------------
    */

    if (path === '/projects/add') {
        return <AddProject />;
    }

    if (path.startsWith('/projects/edit/')) {
        const editId = path.split('/')[3];

        return <AddProject editId={editId} />;
    }

    /*
    |--------------------------------------------------------------------------
    | PROJECTS ADMIN
    |--------------------------------------------------------------------------
    */

    if (path === '/projects') {
        return <Project />;
    }

    /*
    |--------------------------------------------------------------------------
    | LOGIN / DEFAULT PAGE
    |--------------------------------------------------------------------------
    */

    return <Login />;
}


/*
|--------------------------------------------------------------------------
| RENDER REACT
|--------------------------------------------------------------------------
*/

createRoot(
    document.getElementById('app')
).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
