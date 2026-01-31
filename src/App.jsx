import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import Signup from './components/signup/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Stats from './components/stats/Stats';
import Profile from './components/profile/Profile';
import Test from './components/test/Test';
import MainLayout from './components/layout/MainLayout';
import CampiginMangement from './components/campign/CampiginMangement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/test" element={<Test />} />
          <Route path="/campign" element={<CampiginMangement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
