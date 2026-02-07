import React, { useEffect, useState } from 'react';
import { Download, X, Filter, ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import reportData from '../../data/reportData.json';
import './Report.css';

const Report = () => {
    const [rows, setRows] = useState(reportData);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [campaignOptions, setCampaignOptions] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalRecords: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        campaignName: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        creditMin: '',
        creditMax: '',
        transactionType: '',
        startDate: '',
        endDate: '',
        search: '',
        sortBy: 'start_date_time',
        order: 'desc',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        const fetchReport = async () => {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);

            const formatDate = (date) => date.toISOString().split('T')[0];
            const start = formatDate(startDate);
            const end = formatDate(endDate);

            setFilters((prev) => ({
                ...prev,
                startDate: start,
                endDate: end,
                page: 1
            }));

            await fetchFilteredReports({
                ...filters,
                startDate: start,
                endDate: end
            });
        };

        fetchReport();
    }, []);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch(
                    'https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net/campaigns?skip=0&limit=100&include_details=false',
                    {
                        headers: {
                            accept: 'application/json'
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error(`Request failed with ${response.status}`);
                }
                const data = await response.json();
                const campaigns = data?.data?.campaigns || data?.campaigns || [];
                const options = campaigns
                    .map((item) => item.campaign_name)
                    .filter(Boolean);
                setCampaignOptions(Array.from(new Set(options)));
            } catch (error) {
                console.error('Failed to load campaigns:', error);
                setCampaignOptions([]);
            }
        };

        fetchCampaigns();
    }, []);

    const buildFiltersPayload = (currentFilters) => {
        const payloadFilters = [];

        if (currentFilters.status) {
            payloadFilters.push({
                field: 'status',
                operator: '=',
                value: currentFilters.status
            });
        }

        if (currentFilters.campaignName) {
            payloadFilters.push({
                field: 'campaign_name',
                operator: 'LIKE',
                value: currentFilters.campaignName
            });
        }

        if (currentFilters.customerName) {
            payloadFilters.push({
                field: 'customer_name',
                operator: 'LIKE',
                value: currentFilters.customerName
            });
        }

        if (currentFilters.customerEmail) {
            payloadFilters.push({
                field: 'customer_email',
                operator: 'LIKE',
                value: currentFilters.customerEmail
            });
        }

        if (currentFilters.customerPhone) {
            payloadFilters.push({
                field: 'customer_phone',
                operator: 'LIKE',
                value: currentFilters.customerPhone
            });
        }

        if (currentFilters.transactionType) {
            payloadFilters.push({
                field: 'transaction_type',
                operator: '=',
                value: currentFilters.transactionType
            });
        }

        if (currentFilters.creditMin && currentFilters.creditMax) {
            payloadFilters.push({
                field: 'credit_spent',
                operator: 'BETWEEN',
                value_from: Number(currentFilters.creditMin),
                value_to: Number(currentFilters.creditMax)
            });
        } else if (currentFilters.creditMin) {
            payloadFilters.push({
                field: 'credit_spent',
                operator: '>=',
                value: Number(currentFilters.creditMin)
            });
        } else if (currentFilters.creditMax) {
            payloadFilters.push({
                field: 'credit_spent',
                operator: '<=',
                value: Number(currentFilters.creditMax)
            });
        }

        if (currentFilters.startDate && currentFilters.endDate) {
            payloadFilters.push({
                field: 'start_date_time',
                operator: 'BETWEEN',
                value_from: `${currentFilters.startDate}T00:00:00`,
                value_to: `${currentFilters.endDate}T23:59:59`
            });
        }

        return payloadFilters;
    };

    const fetchFilteredReports = async (currentFilters) => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const payload = {
                    filters: buildFiltersPayload(currentFilters),
                    search: currentFilters.search || undefined,
                    page: currentFilters.page,
                    page_size: currentFilters.pageSize,
                    sort_by: currentFilters.sortBy || undefined,
                    order: currentFilters.order || undefined
                };

                const response = await fetch(
                    'https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net/reports/filter',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            accept: 'application/json'
                        },
                        body: JSON.stringify(payload)
                    }
                );
                if (!response.ok) {
                    throw new Error(`Request failed with ${response.status}`);
                }
                const data = await response.json();
                const resultRows = data?.data || data?.results || data?.reports || data;
                setRows(Array.isArray(resultRows) ? resultRows : []);
                setPagination({
                    page: data?.page ?? currentFilters.page,
                    pageSize: data?.page_size ?? currentFilters.pageSize,
                    totalRecords: data?.total_records ?? data?.total ?? 0
                });
            } catch (error) {
                console.error('Failed to load report:', error);
                setLoadError('Failed to load latest report. Showing cached data.');
                setRows(reportData);
            } finally {
                setIsLoading(false);
            }
        };

    return (
        <div className="report-container">
            <div className="report-header">
                <h2 className="report-title">Credit & Debit Report</h2>
                {loadError && <div className="report-error">{loadError}</div>}
                {!loadError && isLoading && <div className="report-loading">Loading...</div>}
                <button
                    type="button"
                    className="report-filter-btn"
                    onClick={() => setFiltersOpen(true)}
                >
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            <div className="report-table-card">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>
                                <button
                                    type="button"
                                    className={`sort-header ${filters.sortBy === 'campaign_name' ? 'active' : ''}`}
                                    onClick={() => {
                                        const nextOrder = filters.sortBy === 'campaign_name' && filters.order === 'asc' ? 'desc' : 'asc';
                                        const next = { ...filters, sortBy: 'campaign_name', order: nextOrder };
                                        setFilters(next);
                                        fetchFilteredReports(next);
                                    }}
                                >
                                    Campaign Name
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>
                                <button
                                    type="button"
                                    className={`sort-header ${filters.sortBy === 'narrative_name' ? 'active' : ''}`}
                                    onClick={() => {
                                        const nextOrder = filters.sortBy === 'narrative_name' && filters.order === 'asc' ? 'desc' : 'asc';
                                        const next = { ...filters, sortBy: 'narrative_name', order: nextOrder };
                                        setFilters(next);
                                        fetchFilteredReports(next);
                                    }}
                                >
                                    Narrative Name
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>
                                <button
                                    type="button"
                                    className={`sort-header ${filters.sortBy === 'call_duration' ? 'active' : ''}`}
                                    onClick={() => {
                                        const nextOrder = filters.sortBy === 'call_duration' && filters.order === 'asc' ? 'desc' : 'asc';
                                        const next = { ...filters, sortBy: 'call_duration', order: nextOrder };
                                        setFilters(next);
                                        fetchFilteredReports(next);
                                    }}
                                >
                                    Call Duration
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>
                                <button
                                    type="button"
                                    className={`sort-header ${filters.sortBy === 'start_date_time' ? 'active' : ''}`}
                                    onClick={() => {
                                        const nextOrder = filters.sortBy === 'start_date_time' && filters.order === 'asc' ? 'desc' : 'asc';
                                        const next = { ...filters, sortBy: 'start_date_time', order: nextOrder };
                                        setFilters(next);
                                        fetchFilteredReports(next);
                                    }}
                                >
                                    Start Date Time
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>
                                <button
                                    type="button"
                                    className={`sort-header ${filters.sortBy === 'credit_spent' ? 'active' : ''}`}
                                    onClick={() => {
                                        const nextOrder = filters.sortBy === 'credit_spent' && filters.order === 'asc' ? 'desc' : 'asc';
                                        const next = { ...filters, sortBy: 'credit_spent', order: nextOrder };
                                        setFilters(next);
                                        fetchFilteredReports(next);
                                    }}
                                >
                                    Credit Spent
                                    <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <tr key={row.call_id || row.callId} onClick={() => setSelectedRow(row)}>
                                    <td>{row.campaign_name || row.campaignName || '-'}</td>
                                    <td>{row.narrative_name || row.narrativeName || '-'}</td>
                                    <td>{row.call_duration || row.callDuration || '-'}</td>
                                    <td>{row.start_date_time || row.startDateTime || '-'}</td>
                                    <td>{row.credit_spent || row.creditSpent || '-'}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="download-btn"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                const url = row.download_url || row.downloadUrl;
                                                if (url) {
                                                    window.open(url, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                            aria-label="Download recording"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="report-empty">
                                    No report data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="report-pagination">
                <div className="page-info">
                    Page {pagination.page} of {Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize))}
                </div>
                <div className="page-actions">
                    <button
                        type="button"
                        className="page-icon-btn"
                        onClick={() => {
                            const next = { ...filters, page: 1 };
                            setFilters(next);
                            fetchFilteredReports(next);
                        }}
                        disabled={isLoading || pagination.page === 1}
                        aria-label="First page"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        type="button"
                        className="page-icon-btn"
                        onClick={() => {
                            const nextPage = Math.max(1, pagination.page - 1);
                            const next = { ...filters, page: nextPage };
                            setFilters(next);
                            fetchFilteredReports(next);
                        }}
                        disabled={isLoading || pagination.page === 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        className="page-icon-btn"
                        onClick={() => {
                            const totalPages = Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize));
                            const nextPage = Math.min(totalPages, pagination.page + 1);
                            const next = { ...filters, page: nextPage };
                            setFilters(next);
                            fetchFilteredReports(next);
                        }}
                        disabled={
                            isLoading ||
                            pagination.page >= Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize))
                        }
                        aria-label="Next page"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        type="button"
                        className="page-icon-btn"
                        onClick={() => {
                            const totalPages = Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize));
                            const next = { ...filters, page: totalPages };
                            setFilters(next);
                            fetchFilteredReports(next);
                        }}
                        disabled={
                            isLoading ||
                            pagination.page >= Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize))
                        }
                        aria-label="Last page"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>

            {selectedRow && (
                <div className="report-modal-overlay" onClick={() => setSelectedRow(null)}>
                    <div className="report-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="report-modal-header">
                            <h3>Call Details</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setSelectedRow(null)}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="report-modal-grid">
                            <div>
                                <span className="detail-label">Campaign Name</span>
                                <span className="detail-value">{selectedRow.campaign_name || selectedRow.campaignName || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Narrative Name</span>
                                <span className="detail-value">{selectedRow.narrative_name || selectedRow.narrativeName || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Call Duration</span>
                                <span className="detail-value">{selectedRow.call_duration || selectedRow.callDuration || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Start Date Time</span>
                                <span className="detail-value">{selectedRow.start_date_time || selectedRow.startDateTime || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Credit Spent</span>
                                <span className="detail-value">{selectedRow.credit_spent || selectedRow.creditSpent || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Customer Name</span>
                                <span className="detail-value">{selectedRow.customer_name || selectedRow.customerName || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{selectedRow.customer_email || selectedRow.customerEmail || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{selectedRow.customer_phone || selectedRow.customerPhone || '-'}</span>
                            </div>
                            <div>
                                <span className="detail-label">Status</span>
                                <span className="detail-value">{selectedRow.status || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filtersOpen && (
                <div className="report-filter-overlay" onClick={() => setFiltersOpen(false)}>
                    <div className="report-filter-panel" onClick={(event) => event.stopPropagation()}>
                        <div className="report-filter-header">
                            <h3>Filters</h3>
                            <button
                                type="button"
                                className="filter-close-btn"
                                onClick={() => setFiltersOpen(false)}
                                aria-label="Close filters"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="report-filter-body">
                            <div className="filter-group">
                                <label>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="">All</option>
                                    <option value="Success">Success</option>
                                    <option value="Busy">Busy</option>
                                    <option value="No Answer">No Answer</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Campaign Name</label>
                                <select
                                    value={filters.campaignName}
                                    onChange={(e) => setFilters({ ...filters, campaignName: e.target.value })}
                                >
                                    <option value="">All</option>
                                    {campaignOptions.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    placeholder="Search customer"
                                    value={filters.customerName}
                                    onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Email</label>
                                <input
                                    type="text"
                                    placeholder="Search email"
                                    value={filters.customerEmail}
                                    onChange={(e) => setFilters({ ...filters, customerEmail: e.target.value })}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    placeholder="Search phone"
                                    value={filters.customerPhone}
                                    onChange={(e) => setFilters({ ...filters, customerPhone: e.target.value })}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Transaction Type</label>
                                <select
                                    value={filters.transactionType}
                                    onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                                >
                                    <option value="">All</option>
                                    <option value="D">Debit</option>
                                    <option value="C">Credit</option>
                                </select>
                            </div>
                            <div className="filter-group two-col">
                                <div>
                                    <label>Credit Min</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={filters.creditMin}
                                        onChange={(e) => setFilters({ ...filters, creditMin: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Credit Max</label>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        value={filters.creditMax}
                                        onChange={(e) => setFilters({ ...filters, creditMax: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="filter-group two-col">
                                <div>
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Global Search</label>
                                <input
                                    type="text"
                                    placeholder="Search anything"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="filter-group two-col">
                                <div>
                                    <label>Page Size</label>
                                    <select
                                        value={filters.pageSize}
                                        onChange={(e) => setFilters({ ...filters, pageSize: Number(e.target.value) })}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Order</label>
                                    <select
                                        value={filters.order}
                                        onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                                    >
                                        <option value="desc">Desc</option>
                                        <option value="asc">Asc</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="report-filter-actions">
                            <button
                                type="button"
                                className="filter-btn ghost"
                                onClick={() => {
                                    const resetFilters = {
                                        ...filters,
                                        status: '',
                                        campaignName: '',
                                        customerName: '',
                                        customerEmail: '',
                                        customerPhone: '',
                                        creditMin: '',
                                        creditMax: '',
                                        transactionType: '',
                                        search: '',
                                        sortBy: 'start_date_time',
                                        order: 'desc',
                                        page: 1,
                                        pageSize: 10
                                    };
                                    setFilters(resetFilters);
                                    fetchFilteredReports(resetFilters);
                                }}
                                disabled={isLoading}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                className="filter-btn"
                                onClick={() => {
                                    fetchFilteredReports(filters);
                                    setFiltersOpen(false);
                                }}
                                disabled={isLoading}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;

