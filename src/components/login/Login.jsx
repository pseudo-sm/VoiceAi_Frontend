import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Mock authentication logic
        setTimeout(() => {
            if (username === 'admin' && password === 'adminpassword') {
                toast.success('Login successful!');
                navigate('/stats');
            } else {
                // setError('Invalid username or password');
                toast.error('Invalid username or password');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Side - Branding */}
                <div className="login-left">
                    <div className="brand-content">
                        <div className="login-brand">
                            <div className="brand-logo">T</div>
                            <span className="brand-text">Telivi</span>
                        </div>
                        <h1 className="hero-title">
                            Intelligent Voice AI <br /> for Your Business
                        </h1>
                        <p className="hero-subtitle">
                            Automate calls, enhance customer experience, and get real-time analytics with our advanced voice assistant platform.
                        </p>

                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon"><Check size={16} /></div>
                                <span>Automated Outbound Calls</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Check size={16} /></div>
                                <span>Real-time Transcription</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Check size={16} /></div>
                                <span>Detailed Analytics</span>
                            </div>
                        </div>
                    </div>

                    <div className="abstract-shape shape-1"></div>
                    <div className="abstract-shape shape-2"></div>
                </div>

                {/* Right Side - Form */}
                <div className="login-right">
                    <div className="login-form-container">
                        <div className="form-header">
                            <h2>Welcome back</h2>
                            <p>Please enter your details to sign in.</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        className="login-form-input"
                                        // placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type="password"
                                        className="login-form-input"
                                        // placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">Forgot password?</a>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="loader"></span>
                                ) : (
                                    <>
                                        Sign in <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            {/* <div className="divider">
                                <span>or continue with</span>
                            </div>

                            <div className="social-login">
                                <button type="button" className="social-btn">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                                    <span>Google</span>
                                </button>
                                <button type="button" className="social-btn">
                                    <img src="https://www.svgrepo.com/show/448239/microsoft.svg" alt="Microsoft" />
                                    <span>Microsoft</span>
                                </button>
                            </div>

                            <p className="signup-link">
                                Don't have an account? <Link to="/signup">Sign up</Link>
                            </p> */}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
