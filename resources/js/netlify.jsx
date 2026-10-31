
import React from 'react';
import { createRoot } from 'react-dom/client';

import Home from './visitor/Home';
import ErrorBoundary from './Components/ErrorBoundary';

import '../css/app.css';
import '../css/profile-modal.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function NetlifyApp() {
    return (
        <React.StrictMode>
            <ErrorBoundary>
                <Home />
            </ErrorBoundary>
        </React.StrictMode>
    );
}

createRoot(document.getElementById('app')).render(
    <NetlifyApp />
);
