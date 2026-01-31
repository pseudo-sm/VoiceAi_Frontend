import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
