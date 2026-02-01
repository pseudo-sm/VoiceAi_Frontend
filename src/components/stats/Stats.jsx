import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Phone, PhoneIncoming, Clock, Megaphone,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import statsData from '../../data/statsData.json';
import './Stats.css';

const Stats = () => {
    const [globalFilter, setGlobalFilter] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState(statsData);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    const { summary, statusBreakdown, campaignProgress, appointmentTable } = stats;
    const currentSummary = summary[globalFilter] || summary.daily;

    // Filter table data based on selected date
    const filteredTableData = appointmentTable.filter(item => item.date === selectedDate);

    const StatCard = ({ label, value, trend, isIncrease, icon: Icon, color }) => (
        <div className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={20} />
                </div>
                <div>
                    <div className="stat-value">{value}</div>
                </div>
            </div>
            <div className={`stat-trend-badge ${isIncrease ? 'trend-up' : 'trend-down'}`}>
                {isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}%
                <span>last month</span>
            </div>
        </div>
    );

    useEffect(() => {
        const fetchStats = async () => {
            const endpoint = import.meta.env.VITE_STATS_API_URL;
            if (!endpoint) {
                setStats(statsData);
                return;
            }

            setIsLoading(true);
            setLoadError(null);

            try {
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`Request failed with ${response.status}`);
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats:', error);
                setLoadError('Failed to load latest stats. Showing cached data.');
                setStats(statsData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="stats-container">
            {/* Header */}
            <div className="stats-header">
                <h2 className="stats-title">Analytics Overview</h2>
                {loadError && <div className="stats-error">{loadError}</div>}
                {!loadError && isLoading && <div className="stats-loading">Loading...</div>}
                <div className="filter-segmented-control">
                    <button
                        className={`filter-btn ${globalFilter === 'daily' ? 'active' : ''}`}
                        onClick={() => setGlobalFilter('daily')}
                    >
                        Today
                    </button>
                    <button
                        className={`filter-btn ${globalFilter === 'weekly' ? 'active' : ''}`}
                        onClick={() => setGlobalFilter('weekly')}
                    >
                        This Week
                    </button>
                    <button
                        className={`filter-btn ${globalFilter === 'monthly' ? 'active' : ''}`}
                        onClick={() => setGlobalFilter('monthly')}
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <StatCard
                    label="Total Calls"
                    value={currentSummary.totalCalls.value}
                    trend={currentSummary.totalCalls.trend}
                    isIncrease={currentSummary.totalCalls.isIncrease}
                    icon={Phone}
                    color="#3b82f6"
                />
                <StatCard
                    label="Answered"
                    value={currentSummary.answered.value}
                    trend={currentSummary.answered.trend}
                    isIncrease={currentSummary.answered.isIncrease}
                    icon={PhoneIncoming}
                    color="#10b981"
                />
                <StatCard
                    label="Total Campaigns"
                    value={currentSummary.totalCampaigns.value}
                    trend={currentSummary.totalCampaigns.trend}
                    isIncrease={currentSummary.totalCampaigns.isIncrease}
                    icon={Megaphone}
                    color="#8b5cf6"
                />
                <StatCard
                    label="Avg Call Duration"
                    value={currentSummary.avgCallDuration.value}
                    trend={currentSummary.avgCallDuration.trend}
                    isIncrease={currentSummary.avgCallDuration.isIncrease}
                    icon={Clock}
                    color="#f59e0b"
                />
                <StatCard
                    label="Total Call Minutes"
                    value={currentSummary.totalCallMinutes.value}
                    trend={currentSummary.totalCallMinutes.trend}
                    isIncrease={currentSummary.totalCallMinutes.isIncrease}
                    icon={Clock}
                    color="#0ea5e9"
                />
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Status vs Call Count */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Status vs Call Count</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Campaign Progress Report */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Campaigns Progress Report</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={campaignProgress} layout="vertical" barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                width={140}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 8, 8, 0]} />
                            <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Book Appointment Table */}
            <div className="table-card">
                <div className="table-header">
                    <h3 className="table-title">Book Appointments</h3>
                    <input
                        type="date"
                        className="date-picker"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTableData.length > 0 ? (
                            filteredTableData.map((item) => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>{item.date}</td>
                                    <td>{item.name}</td>
                                    <td>{item.phone}</td>
                                    <td>{item.email}</td>
                                    <td>
                                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    No appointments found for this date.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stats;
