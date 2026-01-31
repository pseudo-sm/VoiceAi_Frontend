import React,{useState,useRef} from "react";
import "./CampiginMangement.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search,
  Upload,
  X,
  Eye,
  Pencil,
  Download,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Users,
  Phone,
  CheckCircle,
  Clock,
} from "lucide-react";
const CampiginMangement = () => {

const [modelOpen, setModelOpen] = useState(false);
const [editModelOpen, setEditMModelOpen] = useState(false);
const [campaigns, setCampaigns] = useState([]);
const [selectedCampaignId, setSelectedCampaignId] = useState(null);
const navigate = useNavigate();
const [campaign, setCampaign] = useState({
  name: "",
  description: "",
  narrative: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: ""
});


const handleCreate = () => {
  const newCampaign = {
    id: Date.now(),
    name: campaign.name,
    description: campaign.description,
    narrative: campaign.narrative,
    startDate: campaign.startDate,
    startTime: campaign.startTime,
    endDate: campaign.endDate,
    endTime: campaign.endTime,
  };

  setCampaigns((prev) => [...prev, newCampaign]);
  setModelOpen(false);

  // reset form (optional but good UX)
  setCampaign({
    name: "",
    description: "",
    narrative: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: ""
  });
};

 const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("Selected file:", file);

    // 👉 upload logic here (API call, FormData, etc.)
  };

const handleView = (item) => {
  setCampaign({ ...item });
  setSelectedCampaignId(item.id);
  setEditMModelOpen(true);
};



const handleChange = (e) => {
  const { name, value } = e.target;
  setCampaign((prev) => ({
    ...prev,
    [name]: value
  }));
};


const handleUpdate = () => {
  setCampaigns((prev) =>
    prev.map((item) =>
      item.id === selectedCampaignId ? { ...campaign } : item
    )
  );

  setEditMModelOpen(false);
  setSelectedCampaignId(null);
};

  const currentData = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      vehicleName: "Toyota Corolla",
      vehicleNo: "ABC-1234",
      status: "Done",
      lastCalled: "2025-01-20T10:30:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      vehicleName: "Honda Civic",
      vehicleNo: "XYZ-5678",
      status: "Pending",
      lastCalled: "2025-01-18T14:15:00Z",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      vehicleName: "Ford Mustang",
      vehicleNo: "MUS-2024",
      status: "Done",
      lastCalled: "2025-01-22T09:00:00Z",
    },
  ];

  return (
    <div className="CampiginMangement-b">
        <div>
<h1>Campigin Management</h1>
<button className="action-button upload-button" onClick={()=>{setModelOpen(true)}}>Create Campigin</button>
        </div>
      

<div className="table-container" >
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
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>


<tbody>
{campaigns.map((item) => {
  const startDT =
    item.startDate && item.startTime
      ? new Date(`${item.startDate}T${item.startTime}`)
      : null;

  const endDT =
    item.endDate && item.endTime
      ? new Date(`${item.endDate}T${item.endTime}`)
      : null;

  const now = new Date();

  const status =
    startDT && now < startDT
      ? "Upcoming"
      : endDT && now > endDT
      ? "Completed"
      : "Active";

  return (
    <tr key={item.id} >
      <td  onClick={() => { console.log(item); navigate("/dashboard", { state: item })}} style={{cursor:"pointer"}}>
        <div className="customer-cell">
          {/* <div className="avatar">
            {item.name.charAt(0)}
          </div> */}
          <div className="customer-info">
            <span className="customer-name">{item.name}</span>
            {/* <span className="customer-email">{item.description}</span> */}
          </div>
        </div>
      </td>

      <td>{item.description}</td>
      <td>{item.narrative}</td>

      <td>{item.startDate || "-"}</td>
      <td>{item.startTime || "-"}</td>

      <td>{item.endDate || "-"}</td>
      <td>{item.endTime || "-"}</td>

      <td>
        <span
          className={`status-badge ${
            status === "Upcoming"
              ? "status-pending"
              : status === "Completed"
              ? "status-done"
              : "status-active"
          }`}
        >
          {status}
        </span>
      </td>

      <td>
        <div className="action-buttons">
          <button
            className="action-link"
            onClick={() => handleView(item)}
          >
            <Pencil />
          </button>
        </div>
      </td>
    </tr>
  );
})}



  {campaigns.length === 0 && (
    <tr>
      <td
        colSpan="7"
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "#64748b",
        }}
      >
        No campaigns found.
      </td>
    </tr>
  )}
</tbody>

  </table>
</div>



{modelOpen && (
  <div className="modal-overlay" onClick={() => setModelOpen(false)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      
      <div className="modal-header">
        <h2>Create Campaign</h2>
        <button className="modal-close" onClick={() => setModelOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="modal-body">
        <div className="form-group">
          <label>Campaign Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter campaign name"
            value={campaign.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Campaign Description</label>
          <textarea
            name="description"
            placeholder="Enter description"
            value={campaign.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Campaign Narrative</label>
          <textarea
            name="narrative"
            placeholder="Enter narrative"
            value={campaign.narrative}
            onChange={handleChange}
          />
        </div>

     <div className="form-group">
  <label>Start Date</label>
  <input
    type="date"
    name="startDate"
    value={campaign.startDate}
    onChange={handleChange}
  />
</div>

<div className="form-group">
  <label>Start Time</label>
  <input
    type="time"
    name="startTime"
    value={campaign.startTime}
    onChange={handleChange}
  />
</div>


     <div className="form-group">
  <label>End Date</label>
  <input
    type="date"
    name="endDate"
    value={campaign.endDate}
    onChange={handleChange}
  />
</div>

<div className="form-group">
  <label>End Time</label>
  <input
    type="time"
    name="endTime"
    value={campaign.endTime}
    onChange={handleChange}
  />
</div>

      </div>

      <div className="modal-footer">
        <button className="btn cancel" onClick={() => setModelOpen(false)}>
          Cancel
        </button>
        <button className="btn primary" onClick={handleCreate}>
          Create
        </button>
      </div>

    </div>
  </div>
)}
{editModelOpen && (
  <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Edit Campaign</h2>
        <button className="modal-close" onClick={() => setEditMModelOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="modal-body">

        <div className="form-group">
          <label>Campaign Name</label>
          <input
            type="text"
            name="name"
            value={campaign.name}
            onChange={handleChange}
          />
        </div>
  <div className="form-group  new-stl">
       <label>  </label>
       {/* <input type="file" name="file"  /> */}
        <>
      <button
        className="action-button upload-button"
        style={{ height: "37px", width: "200px", alignItems: "center", justifyContent: "center" }}
        onClick={handleButtonClick}
      >
        <Upload /> Upload file
      </button>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
       {/* <button className="action-button upload-button" style={{height:"37px",width:"200px",alignItems:"center",justifyContent:"center"}}  > <Upload/>Upload file</button> */}
      </div>
        <div className="form-group">
          <label>Campaign Description</label>
          <textarea
            name="description"
            value={campaign.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Campaign Narrative</label>
          <textarea
            name="narrative"
            value={campaign.narrative}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={campaign.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={campaign.startTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={campaign.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            name="endTime"
            value={campaign.endTime}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn cancel" onClick={() => setEditMModelOpen(false)}>
          Cancel
        </button>
        <button className="btn primary" onClick={handleUpdate}>
          Update
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};
export default CampiginMangement;
