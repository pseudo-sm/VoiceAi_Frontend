import React, { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Phone, PhoneIncoming, PhoneMissed, Clock,
    ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react';
import statsData from '../../data/statsData.json';
import './Stats.css';

const Stats = () => {
    const [globalFilter, setGlobalFilter] = useState('daily');
    const [graphFilter, setGraphFilter] = useState('1W');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const { summary, callTrends, appointments, appointmentTable } = statsData;
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

    return (
        <div className="stats-container">
            {/* Header */}
            <div className="stats-header">
                <h2 className="stats-title">Analytics Overview</h2>
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
                    label="Rejected"
                    value={currentSummary.rejected.value}
                    trend={currentSummary.rejected.trend}
                    isIncrease={currentSummary.rejected.isIncrease}
                    icon={PhoneMissed}
                    color="#ef4444"
                />
                <StatCard
                    label="Total Duration"
                    value={currentSummary.duration.value}
                    trend={currentSummary.duration.trend}
                    isIncrease={currentSummary.duration.isIncrease}
                    icon={Clock}
                    color="#f59e0b"
                />
            </div>

            {/* Charts & Appointments Row */}
            <div className="charts-row">
                {/* Call Volume Graph */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Call Volume Trends</h3>
                        <div className="chart-filters">
                            {['1W', '2W', '1M', '6M'].map(filter => (
                                <button
                                    key={filter}
                                    className={`chart-filter-btn ${graphFilter === filter ? 'active' : ''}`}
                                    onClick={() => setGraphFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={callTrends[graphFilter]}>
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="calls"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCalls)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Appointments & Reminders */}
                <div className="appointments-col">
                    <h3 className="chart-title"> Appointments & Reminders</h3>
                    <div className="appt-card">

                        <div className="appt-title">Appointments Booked</div>
                        <div className="stat-header" >
                            <div className="stat-icon-wrapper" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
                                <Calendar size={20} />
                            </div>
                            <div className="appt-value">{appointments.booked.value}</div>
                        </div>
                        <div className="appt-trend">
                            <span className="trend-text-up">+{appointments.booked.trend}%</span> compared to last month
                        </div>
                    </div>
                    <div className="appt-card">

                        <div className="appt-title">Reminder Calls</div>
                        <div className="stat-header" >
                            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ec489920', color: '#ec4899' }}>
                                <Clock size={20} />
                            </div>
                            <div className="appt-value">{appointments.reminders.value}</div>
                        </div>
                        <div className="appt-trend">
                            <span className="trend-text-up">+{appointments.reminders.trend}%</span> compared to last month
                        </div>
                    </div>
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
