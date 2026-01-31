import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <header className="navbar">
            <div className="navbar-right" ref={dropdownRef}>
                <button
                    className={`profile-trigger ${isDropdownOpen ? 'active' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <div className="nav-avatar">AU</div>
                    <span className="nav-username">Admin User</span>
                    <ChevronDown size={16} className={`nav-chevron ${isDropdownOpen ? 'rotate' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="profile-dropdown">
                        <div className="dropdown-header">
                            <span className="dropdown-name">Admin User</span>
                            <span className="dropdown-email">admin@telivi.ai</span>
                        </div>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={() => {
                            navigate('/profile');
                            setIsDropdownOpen(false);
                        }}>
                            <User size={16} />
                            <span>My Profile</span>
                        </button>
                        <button className="dropdown-item" onClick={() => {
                            // navigate('/settings'); // Future implementation
                            setIsDropdownOpen(false);
                        }}>
                            <Settings size={16} />
                            <span>Settings</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
