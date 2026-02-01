import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import reportData from '../../data/reportData.json';
import './Report.css';

const Report = () => {
    const [rows, setRows] = useState(reportData);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            const endpoint = import.meta.env.VITE_REPORT_API_URL;
            if (!endpoint) {
                setRows(reportData);
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
                setRows(data);
            } catch (error) {
                console.error('Failed to load report:', error);
                setLoadError('Failed to load latest report. Showing cached data.');
                setRows(reportData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, []);

    return (
        <div className="report-container">
            <div className="report-header">
                <h2 className="report-title">Credit & Debit Report</h2>
                {loadError && <div className="report-error">{loadError}</div>}
                {!loadError && isLoading && <div className="report-loading">Loading...</div>}
            </div>

            <div className="report-table-card">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Call ID</th>
                            <th>Campaign ID</th>
                            <th>Narrative Name</th>
                            <th>Call Duration</th>
                            <th>Start Date Time</th>
                            <th>Credit Spent</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <tr key={row.callId} onClick={() => setSelectedRow(row)}>
                                    <td>#{row.callId}</td>
                                    <td>#{row.campaignId}</td>
                                    <td>{row.narrativeName}</td>
                                    <td>{row.callDuration}</td>
                                    <td>{row.startDateTime}</td>
                                    <td>{row.creditSpent}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="download-btn"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (row.downloadUrl) {
                                                    window.open(row.downloadUrl, '_blank', 'noopener,noreferrer');
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
                                <td colSpan="7" className="report-empty">
                                    No report data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                                <span className="detail-label">Call ID</span>
                                <span className="detail-value">#{selectedRow.callId}</span>
                            </div>
                            <div>
                                <span className="detail-label">Campaign ID</span>
                                <span className="detail-value">#{selectedRow.campaignId}</span>
                            </div>
                            <div>
                                <span className="detail-label">Narrative Name</span>
                                <span className="detail-value">{selectedRow.narrativeName}</span>
                            </div>
                            <div>
                                <span className="detail-label">Call Duration</span>
                                <span className="detail-value">{selectedRow.callDuration}</span>
                            </div>
                            <div>
                                <span className="detail-label">Start Date Time</span>
                                <span className="detail-value">{selectedRow.startDateTime}</span>
                            </div>
                            <div>
                                <span className="detail-label">Credit Spent</span>
                                <span className="detail-value">{selectedRow.creditSpent}</span>
                            </div>
                            <div>
                                <span className="detail-label">Customer Name</span>
                                <span className="detail-value">{selectedRow.customerName}</span>
                            </div>
                            <div>
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{selectedRow.customerEmail}</span>
                            </div>
                            <div>
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{selectedRow.customerPhone}</span>
                            </div>
                            <div>
                                <span className="detail-label">Status</span>
                                <span className="detail-value">{selectedRow.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;

