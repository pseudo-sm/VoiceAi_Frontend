import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Bell, Key, Camera, Save } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        name: 'Admin User',
        role: 'Administrator',
        email: 'admin@telivi.ai',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        bio: 'Senior Administrator managing Voice AI operations and customer interactions.',
        avatar: null // Using initials if null
    });

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleSave = () => {
        setIsEditing(false);
        // Add save logic here (e.g., API call)
    };

    return (
        <div className="profile-container">
            <div className="profile-header-card">
                <div className="profile-cover"></div>
                <div className="profile-info-wrapper">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <span>{getInitials(user.name)}</span>
                            )}
                            <button className="change-avatar-btn">
                                <Camera size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="profile-text-info">
                        <div className="profile-name-section">
                            <h1>{user.name}</h1>
                            <span className="profile-role">{user.role}</span>
                        </div>
                        <div className="profile-actions">
                            {isEditing ? (
                                <button className="btn-primary" onClick={handleSave}>
                                    <Save size={18} /> Save Changes
                                </button>
                            ) : (
                                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content-grid">
                {/* Left Column: Personal Info */}
                <div className="profile-card">
                    <div className="card-header">
                        <h3>Personal Information</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-group">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-value">
                                    <User size={18} />
                                    <span>{user.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="info-group">
                            <label>Email Address</label>
                            <div className="info-value">
                                <Mail size={18} />
                                <span>{user.email}</span>
                            </div>
                        </div>
                        <div className="info-group">
                            <label>Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={user.phone}
                                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-value">
                                    <Phone size={18} />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </div>
                        <div className="info-group">
                            <label>Location</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={user.location}
                                    onChange={(e) => setUser({ ...user, location: e.target.value })}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-value">
                                    <MapPin size={18} />
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </div>
                        <div className="info-group">
                            <label>Bio</label>
                            {isEditing ? (
                                <textarea
                                    value={user.bio}
                                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                    className="form-textarea"
                                    rows="3"
                                />
                            ) : (
                                <p className="bio-text">{user.bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="profile-card">
                    <div className="card-header">
                        <h3>Account Settings</h3>
                    </div>
                    <div className="card-body">
                        <div className="settings-item">
                            <div className="settings-icon-wrapper blue">
                                <Shield size={20} />
                            </div>
                            <div className="settings-info">
                                <h4>Security</h4>
                                <p>Password and authentication settings</p>
                            </div>
                            <button className="btn-text">Change Password</button>
                        </div>
                        <div className="settings-item">
                            <div className="settings-icon-wrapper purple">
                                <Bell size={20} />
                            </div>
                            <div className="settings-info">
                                <h4>Notifications</h4>
                                <p>Manage your email and push notifications</p>
                            </div>
                            <button className="btn-text">Configure</button>
                        </div>
                        <div className="settings-item">
                            <div className="settings-icon-wrapper green">
                                <Key size={20} />
                            </div>
                            <div className="settings-info">
                                <h4>2FA Authentication</h4>
                                <p>Add an extra layer of security</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
