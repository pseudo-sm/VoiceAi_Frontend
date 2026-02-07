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
    const [globalFilter, setGlobalFilter] = useState('all');
    const [stats, setStats] = useState(statsData);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    const { summary, statusBreakdown, campaignProgress } = stats;
    const fallbackSummary = statsData.summary?.daily;
    const currentSummary = summary?.[globalFilter] || summary?.daily || fallbackSummary;
    const currentStatusBreakdown = statusBreakdown?.[globalFilter] || statusBreakdown?.daily || [];
    const currentCampaignProgress = campaignProgress?.[globalFilter] || campaignProgress?.daily || [];

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
            setIsLoading(true);
            setLoadError(null);

            try {
                const response = await fetch(
                    `https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net/dashboard?range_type=${globalFilter}`,
                    { headers: { accept: 'application/json' } }
                );
                if (!response.ok) {
                    throw new Error(`Request failed with ${response.status}`);
                }
                const data = await response.json();
                const payload = data?.[globalFilter];
                if (!payload) {
                    throw new Error('Missing payload for range');
                }

                const mapped = {
                    summary: {
                        [globalFilter]: {
                            totalCalls: {
                                value: payload.summary?.total_calls?.value ?? 0,
                                trend: payload.summary?.total_calls?.trend ?? 0,
                                isIncrease: payload.summary?.total_calls?.is_increase ?? false
                            },
                            answered: {
                                value: payload.summary?.answered?.value ?? 0,
                                trend: payload.summary?.answered?.trend ?? 0,
                                isIncrease: payload.summary?.answered?.is_increase ?? false
                            },
                            totalCampaigns: {
                                value: payload.summary?.total_campaigns?.value ?? 0,
                                trend: payload.summary?.total_campaigns?.trend ?? 0,
                                isIncrease: payload.summary?.total_campaigns?.is_increase ?? false
                            },
                            avgCallDuration: {
                                value: payload.summary?.avg_call_duration?.value ?? '0m 0s',
                                trend: payload.summary?.avg_call_duration?.trend ?? 0,
                                isIncrease: payload.summary?.avg_call_duration?.is_increase ?? false
                            },
                            totalCallMinutes: {
                                value: payload.summary?.total_call_minutes?.value ?? 0,
                                trend: payload.summary?.total_call_minutes?.trend ?? 0,
                                isIncrease: payload.summary?.total_call_minutes?.is_increase ?? false
                            }
                        }
                    },
                    statusBreakdown: {
                        [globalFilter]: payload.status_breakdown || []
                    },
                    campaignProgress: {
                        [globalFilter]: (payload.campaign_progress || []).map((item) => ({
                            name: item.campaign_name ?? item.name ?? 'Campaign',
                            completed: item.completed ?? 0,
                            pending: item.pending ?? 0
                        }))
                    }
                };

                setStats((prev) => ({
                    ...prev,
                    summary: {
                        ...(prev.summary || {}),
                        ...mapped.summary
                    },
                    statusBreakdown: {
                        ...(prev.statusBreakdown || {}),
                        ...mapped.statusBreakdown
                    },
                    campaignProgress: {
                        ...(prev.campaignProgress || {}),
                        ...mapped.campaignProgress
                    }
                }));
            } catch (error) {
                console.error('Failed to load stats:', error);
                setLoadError('Failed to load latest stats. Showing cached data.');
                setStats(statsData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [globalFilter]);

    return (
        <div className="stats-container">
            {/* Header */}
            <div className="stats-header">
                <h2 className="stats-title">Analytics Overview</h2>
                {loadError && <div className="stats-error">{loadError}</div>}
                {!loadError && isLoading && <div className="stats-loading">Loading...</div>}
                <div className="filter-segmented-control">
                    <button
                        className={`filter-btn ${globalFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setGlobalFilter('all')}
                    >
                        All
                    </button>
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
                        <BarChart data={currentStatusBreakdown}>
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
                        <BarChart data={currentCampaignProgress} layout="vertical" barSize={16}>
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
        </div>
    );
};

export default Stats;
