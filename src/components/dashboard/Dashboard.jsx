import React, { useState,useEffect } from "react";
import { toast } from "react-toastify";
import {getCampaignCustomers} from "../campign/CampignService";
import {
  Search,
  Upload,
  X,
  Eye,
  Download,
  Pencil,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Users,
  Phone,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import "./Dashboard.css";

const ActivityItem = ({ log, isExpanded, onToggle }) => {
  // Parse date and time
  const dateObj = new Date(log.date);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="activity-timeline-item">
      <div className="timeline-date-header">{dateStr}</div>
      <div className="timeline-content-wrapper">
        <div className="timeline-marker">
          <div className="timeline-icon">
            <Phone size={14} fill="white" />
          </div>
          <div className="timeline-line"></div>
        </div>
        <div className="timeline-card">
          <div
            className="timeline-card-header"
            onClick={onToggle}
            style={{ cursor: "pointer" }}
          >
            <span className="call-by">
              Call by <span className="font-bold">{log.callBy}</span>
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span className="call-time">{timeStr}</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          <div className="timeline-card-duration">
            Duration <span className="font-bold">{log.duration}</span>
          </div>

          {isExpanded && (
            <div className="timeline-card-note">
              <span className="note-label">Note</span>
              <div className="note-content">
                {log.transcript || "No transcript available for this call."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [dummyData, setDummyData] = useState([]);
  const { state } = useLocation(); // state === item

  console.log("in Dashbord", state); // your item object


useEffect(() => {
  console.log(state,"statet");

  getCampaignCustomers({
    campaignId: state.id,
    skip: 0,
    limit: 100,
    includeCampaign: false,
  })
    .then((response) => {
      // Transform API response to expected format
      const transformedData = response.data.customers.map((customer, index) => ({
        id: customer.campaign_customer_id || index,
        name: customer.customer_name,
        email: customer.email,
        phone: customer.phone_number,
        whatsapp: customer.whatsapp_number,
        gender: customer.gender,
        vehicleName: customer.vehicle_brand,
        vehicleNo: customer.vehicle_make_model,
        purchaseDate: customer.purchase_date,
        lastServiceDate: customer.last_service_date,
        isFreeService: customer.is_free_service,
        status: customer.status,
        campaignCustomerId: customer.campaign_customer_id,
        campaignId: customer.campaign_id,
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
        },
        activityLog: [],
        lastCalled: new Date().toISOString(),
      }));
      
      setDummyData(transformedData);
      console.log("Transformed Customers:", transformedData);
    })
    .catch((error) => {
      console.error("Error fetching customers:", error);
    });
}, [state]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // Simulate upload for now
    toast.info(`Uploading ${selectedFile.name}...`);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      toast.success("File uploaded successfully!");
    }, 1000);
  };

  const itemsPerPage = 50;
  const filteredData = dummyData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getInitials = (name) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " at");
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleDownload = (customer) => {
    toast.success(`Downloading data for ${customer.name}...`);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}

      <div className="table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Description</th>
              <th>Narrative</th>
              <th>Start Date</th>
              <th>Start Time</th>
              <th>End Date</th>
              <th>End Time</th>
              {/* <th>Status</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* <td>
                  <div className="customer-cell">
                    <div className="avatar">{getInitials(state.name)}</div>
                    <div className="customer-info">
                      <span className="customer-name">{item.name}</span>
                      <span className="customer-email">{item.email}</span>
                    </div>
                  </div>
                </td> */}
              <td>{state.name}</td>
              <td>{state.description}</td>
              <td>{state.narrative}</td>
              <td>{state.startDate}</td>
              <td>{state.startTime}</td>
              <td>{state.endDate}</td>
              <td>{state.endTime}</td>
              <td style={{cursor:"pointer"}}>
                {" "}
                <Pencil />{" "}
              </td>

              {/* 
                <td>
                  <span
                    className={`status-badge ${item.status === "Done" ? "status-done" : "status-pending"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{formatDate(item.lastCalled)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-link"
                      onClick={() => handleView(item)}
                    >
                      <Eye size={18} /> View
                    </button>
                    <button
                      className="action-link"
                      onClick={() => handleDownload(item)}
                    >
                      <Download size={18} /> Download
                    </button>
                  </div>
                </td> */}
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        {/* {totalPages > 1 && (
          <div className="pagination">
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )} */}
      </div>

      <div className="dashboard-header">
        <div className="header-content">
          <h1>Customers</h1>
          <p className="header-subtitle">Display all the customers.</p>
        </div>
        <button
            className="action-button upload-button"
            onClick={() =>{
              // console.log("Download file url:", state.campaignFile);
               window.open(state.campaignFile, "_blank");
              //  setIsUploadModalOpen(true)
            }}
          >
            <Download size={20} />
            <span>Download</span>
          </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon icon-blue">
            <Users size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Total Customers</span>
            <span className="summary-value">{dummyData.length}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon icon-yellow">
            <Clock size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Pending Follow-ups</span>
            <span className="summary-value">
              {dummyData.filter((d) => d.status === "Pending").length}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon icon-green">
            <CheckCircle size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Completed Calls</span>
            <span className="summary-value">
              {dummyData.filter((d) => d.status === "Done").length}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon icon-purple">
            <Phone size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Total Interactions</span>
            <span className="summary-value">
              {dummyData.reduce(
                (acc, curr) => acc + curr.activityLog.length,
                0,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="action-button sort-button">
          <ArrowUpDown size={18} />
          <span>Sort</span>
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Vehicle Name</th>
              <th>Vehicle No</th>
              <th>Status</th>
              <th>Last Called</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="customer-cell">
                    <div className="avatar">{getInitials(item.name)}</div>
                    <div className="customer-info">
                      <span className="customer-name">{item.name}</span>
                      <span className="customer-email">{item.email}</span>
                    </div>
                  </div>
                </td>
                <td>{item.vehicleName}</td>
                <td>{item.vehicleNo}</td>
                <td>
                  <span
                    className={`status-badge ${item.status === "Done" ? "status-done" : "status-pending"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{formatDate(item.lastCalled)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-link"
                      onClick={() => handleView(item)}
                    >
                      <Eye size={18} /> View
                    </button>
                    <button
                      className="action-link"
                      onClick={() => handleDownload(item)}
                    >
                      <Download size={18} /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "#64748b",
                  }}
                >
                  No customers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="modal-content upload-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Upload Data</h3>
              <button
                className="close-btn"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {!selectedFile ? (
                <label className="upload-area">
                  <input
                    type="file"
                    className="file-input"
                    accept=".csv, .xlsx"
                    onChange={handleFileSelect}
                  />
                  <Upload className="upload-icon-large" size={48} />
                  <div style={{ marginTop: "1rem" }}>
                    <p className="upload-text">
                      Click to upload CSV or Excel file
                    </p>
                    <p className="upload-subtext">
                      Supported formats: .csv, .xlsx
                    </p>
                  </div>
                </label>
              ) : (
                <div className="file-info">
                  <div className="file-details">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button
                    className="remove-file-btn"
                    onClick={handleRemoveFile}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <button className="download-template">
                <Download size={16} /> Download Sample Template
              </button>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  disabled={!selectedFile}
                  onClick={handleUpload}
                >
                  Upload Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {isViewModalOpen && selectedCustomer && (
        <div
          className="modal-overlay"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-user-header">
                <div className="avatar modal-avatar">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div className="modal-user-info">
                  <h2>{selectedCustomer.name}</h2>
                  <span className="modal-user-email">
                    {selectedCustomer.email}
                  </span>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsViewModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                {/* Left Column: Basic Details */}
                <div className="detail-section">
                  <h3>Basic Details</h3>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">
                      {selectedCustomer.phone}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vehicle Name</span>
                    <span className="detail-value">
                      {selectedCustomer.vehicleName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vehicle No</span>
                    <span className="detail-value">
                      {selectedCustomer.vehicleNo}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      <span
                        className={`status-badge ${selectedCustomer.status === "Done" ? "status-done" : "status-pending"}`}
                      >
                        {selectedCustomer.status}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right Column: Address */}
                <div className="detail-section">
                  <h3>Address</h3>
                  <div className="detail-row">
                    <span className="detail-label">Street</span>
                    <span className="detail-value">
                      {selectedCustomer.address.street}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">City</span>
                    <span className="detail-value">
                      {selectedCustomer.address.city}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">State</span>
                    <span className="detail-value">
                      {selectedCustomer.address.state}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Zip Code</span>
                    <span className="detail-value">
                      {selectedCustomer.address.zip}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="activity-section">
                <h3>Activity Log</h3>
                <div className="activity-list">
                  {selectedCustomer.activityLog.length > 0 ? (
                    selectedCustomer.activityLog.map((log, index) => (
                      <ActivityItem
                        key={index}
                        log={log}
                        isExpanded={expandedActivityId === index}
                        onToggle={() =>
                          setExpandedActivityId(
                            expandedActivityId === index ? null : index,
                          )
                        }
                      />
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                      No activity recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
