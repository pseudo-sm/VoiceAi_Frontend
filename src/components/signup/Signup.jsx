import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Signup Data:', formData);
        // Add logic to handle signup
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2 className="signup-title">Create Account</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Role</label>
                        <select
                            id="role"
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
                <p className="login-link">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
