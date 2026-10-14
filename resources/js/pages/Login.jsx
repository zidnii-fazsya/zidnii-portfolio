import React, { useState } from 'react';
import '../../css/app.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fungsi aman untuk mengambil CSRF Token dari tag meta HTML
    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const csrfToken = getCsrfToken();

            const response = await fetch('/login', {
                method: 'POST',
                // PENTING: credentials wajib disertakan agar cookie session Laravel ikut terkirim
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            // Jika session expired / token mismatch (419), muat ulang halaman untuk refresh token
            if (response.status === 419) {
                setError('Sesi telah berakhir. Memuat ulang halaman...');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Email atau password salah.');
                return;
            }

            // Redirect jika login berhasil
            window.location.href = '/dashboard';

        } catch (error) {
            setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Bagian kiri */}
            <div
                className="login-image"
                style={{
                    backgroundImage: "url('/image/maroonflower.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="image-overlay">
                    <h1>Zidnii Lu'lu Fazsya</h1>
                    <br />
                    <p><strong>Technology & Project Management Enthusiast</strong></p>
                </div>
            </div>

            {/* Bagian kanan */}
            <div className="login-form-section">

                <div className="login-form-container">

                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>
                            Silahkan masuk untuk mengelola portofolio kamu zidnii!!!
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        {error && (
                            <p className="login-error">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Login;