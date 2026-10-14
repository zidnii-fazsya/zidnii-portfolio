import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#080506',
                    color: '#fff',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f87171' }}>
                        Terjadi Masalah Tampilan
                    </h2>
                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem', maxWidth: '400px' }}>
                        Halaman mengalami sedikit kendala. Silakan muat ulang atau periksa kembali koneksi Anda.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.6rem 1.4rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#561C24',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}
                    >
                        Muat Ulang Halaman
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
