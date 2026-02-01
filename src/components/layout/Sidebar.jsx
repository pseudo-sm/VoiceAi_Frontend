import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, FlaskConical, Mic, FileText, Users, Atom} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Mic className="logo-icon" color="#3b82f6" />
                <span className="logo-text">Voice AI</span>
            </div>
            <nav className="sidebar-nav">
                {/* <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard className="nav-icon" />
                    <span>Dashboard</span>
                </NavLink> */}
                <NavLink
                    to="/stats"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <BarChart2 className="nav-icon" />
                    <span>Stats</span>
                </NavLink>
                <NavLink
                    to="/test"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <FlaskConical className="nav-icon" />
                    <span>Test</span>
                </NavLink>
                <NavLink
                    to="/campign"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Atom className="nav-icon" />
                    <span>Manage Campaign</span>
                </NavLink>
                <NavLink
                    to="/report"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <FileText className="nav-icon" />
                    <span>Reports</span>
                </NavLink>
                <NavLink
                    to="/users"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Users className="nav-icon" />
                    <span>Users</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
