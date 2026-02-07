import React,{useState,useRef, useEffect} from "react";
import "./CampiginMangement.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MultiSelect } from 'primereact/multiselect';
import Select from 'react-select';
import {createCampaign,getCampaigns,updateCampaign,getCampaignCustomers,getNarratives,getCampaignById} from "./CampignService";
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
  Import,
} from "lucide-react";
const CampiginMangement = () => {

const options = [
  { label: 'All', value: 'all' },
  { label: 'This Week', value: 'last_7_days' },
  { label: 'This Month', value: 'last_month' }
];


  const monthOptions = [
  { value: 'january', label: 'January' },
  { value: 'february', label: 'February' },
  { value: 'march', label: 'March' },
  { value: 'april', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'june', label: 'June' },
  { value: 'july', label: 'July' },
  { value: 'august', label: 'August' },
  { value: 'september', label: 'September' },
  { value: 'october', label: 'October' },
  { value: 'november', label: 'November' },
  { value: 'december', label: 'December' }
];
    const [selected, setSelected] = useState("");
const [selectedCities, setSelectedCities] = useState([]);
const [modelOpen, setModelOpen] = useState(false);
const [editModelOpen, setEditMModelOpen] = useState(false);
const [campaigns, setCampaigns] = useState([]);
const [selectedCampaignId, setSelectedCampaignId] = useState(null);
const [actionLoading, setActionLoading] = useState({});
 const [selectedFile, setSelectedFile] = useState(null);
 const[loader,setLoader]=useState(false);
const navigate = useNavigate();
const [campaign, setCampaign] = useState({
  name: "",
  description: "",
  narrative: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  location: "",
  slotStartTime: "",
  slotEndTime: "",
  slotCapacity: ""
});

const locationOptions = [
  { value: 'borivali', label: 'Borivali' },
  { value: 'malad_east', label: 'Malad East' },
  { value: 'malad_west', label: 'Malad West' },
  { value: 'andheri_east', label: 'Andheri East' },
  { value: 'andheri_west', label: 'Andheri West' },
  { value: 'goregaon', label: 'Goregaon' },
  { value: 'kandivali', label: 'Kandivali' },
  { value: 'dahisar', label: 'Dahisar' }
];




const [narativeOptions, setNarativeOptions] = useState([]);

useEffect(() => {
  let mounted = true;
  const fetchNarratives = async () => {
    try {
      const resp = await getNarratives({ skip: 0, limit: 100, includeLanguages: false });
      const items = resp.data?.narratives ?? resp.data ?? [];
      const opts = (Array.isArray(items) ? items : []).map((item) => ({
        value: item.narrative_id ?? item.id ?? item.nid ?? item.key ?? item.value,
        label:
          item.narrative_text ?? item.name ?? item.title ?? item.narrative ?? String(item.narrative_id ?? item.id ?? item.nid ?? item.key ?? item.value),
      }));
      if (mounted) setNarativeOptions(opts);
    } catch (err) {
      console.error("Failed to load narratives:", err);
    }
  };

  fetchNarratives();
  return () => {
    mounted = false;
  };
}, []);

const fetchCampaigns = async () => {
  try {
    const response = await getCampaigns({
      skip: 0,
      limit: 100,
      includeDetails: false,
    });
    const normalizedCampaigns = response.data.campaigns.map((item) => ({
      id: item.cid,
      name: item.campaign_name,
      description: item.description,
      narrative: item.narrative_id,
      startDate: item.start_date,
      startTime: item.start_time,
      endDate: item.end_date,
      endTime: item.end_time,
      statusFromApi: item.status,
      days: {
        monday: item.is_monday,
        tuesday: item.is_tuesday,
        wednesday: item.is_wednesday,
        thursday: item.is_thursday,
        friday: item.is_friday,
        saturday: item.is_saturday,
        sunday: item.is_sunday,
      },
      campaignFile: item.campaign_file,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
    setCampaigns(normalizedCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
  }
};

useEffect(() => {
  fetchCampaigns();
}, []);
const handleCreate = async () => {
setLoader(true);
  console.log(
"alldata",
    campaign,
    selectedDays,
    fileInputRef.current.files[0]

  )
  
const payload = {
  campaign_name: campaign.name,
  description: campaign.description,
  status: "ACTIVE",

  enterprise_id: 1,
  location_id: 1,
  narrative_id: campaign.narrative,
  created_by: 1,

  start_date: campaign.startDate,
  start_time: campaign.startTime,
  end_date: campaign.endDate,
  end_time: campaign.endTime,

  is_monday: selectedDays.includes("Monday"),
  is_tuesday: selectedDays.includes("Tuesday"),
  is_wednesday: selectedDays.includes("Wednesday"),
  is_thursday: selectedDays.includes("Thursday"),
  is_friday: selectedDays.includes("Friday"),
  is_saturday: selectedDays.includes("Saturday"),
  is_sunday: selectedDays.includes("Sunday"),

  slots: [
    {
      slot_capacity: 10,
      slot_start_time: "12:00:00",
      slot_end_time: "17:00:00"
    }
  ]
};
const formData = new FormData();

/* 🔥 THIS IS THE KEY LINE */
formData.append("data", JSON.stringify(payload));

if (selectedFile) {
  formData.append("file", selectedFile);
}



//   const formData = new FormData();
//     formData.append("id", 10);
//   formData.append("campaign_name", campaign.name);
//   formData.append("campaign_status", "ACTIVE");
//   formData.append("enterprise_id", 1);


//   formData.append("description", campaign.description);
//   formData.append("narrative_id", campaign.narrative);
//   formData.append("start_date", campaign.startDate);
//   formData.append("start_time", campaign.startTime);
//   formData.append("end_date", campaign.endDate);
//   formData.append("end_time", campaign.endTime);
//   formData.append("is_monday", selectedDays.includes("Monday"));
//   formData.append("is_tuesday", selectedDays.includes("Tuesday"));
//   formData.append("is_wednesday", selectedDays.includes("Wednesday"));
//   formData.append("is_thursday", selectedDays.includes("Thursday"));
//   formData.append("is_friday", selectedDays.includes("Friday"));
//   formData.append("is_saturday", selectedDays.includes("Saturday"));
//   formData.append("is_sunday", selectedDays.includes("Sunday"));
//   formData.append("created_at", "2026-02-01T10:30:45.123Z");
//   formData.append("updated_at", "2026-02-01T10:30:45.123Z");
// formData.append("file", selectedFile);


// const formData = new FormData();

// formData.append("campaign_name", campaign.name);
// formData.append("description", campaign.description);
// formData.append("status", "ACTIVE");

// formData.append("enterprise_id", 1);
// formData.append("location_id", 1);
// formData.append("narrative_id", campaign.narrative);
// formData.append("created_by", 1);

// formData.append("start_date", campaign.startDate);   // "2026-01-01"
// formData.append("start_time", campaign.startTime);   // "00:00:00"
// formData.append("end_date", campaign.endDate);       // "2026-12-31"
// formData.append("end_time", campaign.endTime);       // "23:59:59"

// /* Days */
// formData.append("is_monday", selectedDays.includes("Monday"));
// formData.append("is_tuesday", selectedDays.includes("Tuesday"));
// formData.append("is_wednesday", selectedDays.includes("Wednesday"));
// formData.append("is_thursday", selectedDays.includes("Thursday"));
// formData.append("is_friday", selectedDays.includes("Friday"));
// formData.append("is_saturday", selectedDays.includes("Saturday"));
// formData.append("is_sunday", selectedDays.includes("Sunday"));

// /* Slots (array of objects) */
// formData.append("slots[0][slot_capacity]", 10);
// formData.append("slots[0][slot_start_time]", "12:00:00");
// formData.append("slots[0][slot_end_time]", "17:00:00");

// /* File (if required) */
// if (selectedFile) {
//   formData.append("file", selectedFile);
// }



  // if (fileInputRef.current && fileInputRef.current.files[0]) {
  //   formData.append("file", fileInputRef.current.files[0]);
  // }

  // const result = await createCampaign(formData);
  // const response= await getCampaigns({ skip: 0, limit: 100, includeDetails: false });

  try {
  // 1️⃣ Create campaign
  const result = await createCampaign(formData);

  const response = await getCampaigns({
    skip: 0,
    limit: 100,
    includeDetails: false,
  });

  console.log("getCampaigns response",response);

  toast.success("Campaign created successfully");
} catch (error) {

  const response = await getCampaigns({
  skip: 0,
  limit: 100,
  includeDetails: false,
});

const normalizedCampaigns = response.data.campaigns.map((item) => ({
  id: item.cid,
  name: item.campaign_name,
  description: item.description,
  narrative: item.narrative_id,

  startDate: item.start_date,
  startTime: item.start_time,
  endDate: item.end_date,
  endTime: item.end_time,

  statusFromApi: item.status,

  days: {
    monday: item.is_monday,
    tuesday: item.is_tuesday,
    wednesday: item.is_wednesday,
    thursday: item.is_thursday,
    friday: item.is_friday,
    saturday: item.is_saturday,
    sunday: item.is_sunday,
  },

  campaignFile: item.campaign_file,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
}));

setCampaigns(normalizedCampaigns);

  console.error(error.response?.data || error.message);
  toast.error("Failed to create campaign");
}
finally{
  setLoader(false);
  setModelOpen(false);
}





  console.log("getCampaigns response",response);
  if (!result.success) {
    toast.error("Failed to create campaign");
    return;
  }

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
    endTime: "",
    location: "",
    slotStartTime: "",
    slotEndTime: "",
    slotCapacity: ""
  });
};

const cities = [
  { name: "New York", code: "NY" },
  { name: "London", code: "LDN" },
  { name: "Paris", code: "PRS" },
  { name: "Tokyo", code: "TKY" },
];
 const fileInputRef = useRef(null);
// const options = [
//   { id: 1, label: "React", value: "react" },
//   { id: 2, label: "Vue", value: "vue" },
//   { id: 3, label: "Angular", value: "angular" }
// ];


const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];


const [selectedDays, setSelectedDays] = useState([]);

  const handleDayChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
    console.log(selectedDays);
  };

  const handleSelectAll = () => {
    if (selectedDays.length === days.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(days);
    }
  };

  const handleOpenCreateModal = () => {
    // Reset all form data
    setCampaign({
      name: "",
      description: "",
      narrative: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
      slotStartTime: "",
      slotEndTime: "",
      slotCapacity: ""
    });
    setSelectedDays([]);
    setSelectedFile(null);
    setModelOpen(true);
  };



















  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("Selected file:", file);
    setSelectedFile(file);

    // 👉 upload logic here (API call, FormData, etc.)
  };

// const handleView =async (item) => {

//   const data=await getCampaignById(item.cid)

//   setCampaign({ ...item });
//   setSelectedCampaignId(item.id);
  
//   // Set selected days based on campaign data
//   const campaignDays = [];
//   if (item.days?.monday) campaignDays.push("Monday");
//   if (item.days?.tuesday) campaignDays.push("Tuesday");
//   if (item.days?.wednesday) campaignDays.push("Wednesday");
//   if (item.days?.thursday) campaignDays.push("Thursday");
//   if (item.days?.friday) campaignDays.push("Friday");
//   if (item.days?.saturday) campaignDays.push("Saturday");
//   if (item.days?.sunday) campaignDays.push("Sunday");
  
//   setSelectedDays(campaignDays);
//   setEditMModelOpen(true);
// };


// const handleView = async (item) => {
//   console.log(item,"item in side handelview")
// const data = await getCampaignById({
//   campaignId: item.id,
// });

//   setCampaign(data);
//   setSelectedCampaignId(item.id);

//   const campaignDays = [];
//   const days = data.days;

//   if (days?.monday) campaignDays.push("Monday");
//   if (days?.tuesday) campaignDays.push("Tuesday");
//   if (days?.wednesday) campaignDays.push("Wednesday");
//   if (days?.thursday) campaignDays.push("Thursday");
//   if (days?.friday) campaignDays.push("Friday");
//   if (days?.saturday) campaignDays.push("Saturday");
//   if (days?.sunday) campaignDays.push("Sunday");

//   setSelectedDays(campaignDays);
//   setEditMModelOpen(true);
// };



const handleView = async (item) => {
  try {
    const { data } = await getCampaignById({ campaignId: item.id });

    // Map API response to form-friendly keys
    const campaignData = {
      id: data.cid,
      name: data.campaign_name,
      description: data.description,
      narrative: data.narrative_id,
      location: data.location_id,
      startDate: data.start_date,
      endDate: data.end_date,
      startTime: data.start_time.slice(0,5), // remove seconds for input[type="time"]
      endTime: data.end_time.slice(0,5),
      slotStartTime: data.slots?.[0]?.slot_start_time.slice(0,5) || '',
      slotEndTime: data.slots?.[0]?.slot_end_time.slice(0,5) || '',
      slotCapacity: data.slots?.[0]?.slot_capacity || '',
    };

    // Map days
    const campaignDays = [];
    if (data.is_monday) campaignDays.push("Monday");
    if (data.is_tuesday) campaignDays.push("Tuesday");
    if (data.is_wednesday) campaignDays.push("Wednesday");
    if (data.is_thursday) campaignDays.push("Thursday");
    if (data.is_friday) campaignDays.push("Friday");
    if (data.is_saturday) campaignDays.push("Saturday");
    if (data.is_sunday) campaignDays.push("Sunday");

    setCampaign(campaignData);
    setSelectedCampaignId(data.cid);
    setSelectedDays(campaignDays);
    setEditMModelOpen(true); // make sure state name matches
  } catch (error) {
    console.error("Failed to fetch campaign", error);
  }
};






const handleChange = (e) => {
  const { name, value } = e.target;
  setCampaign((prev) => ({
    ...prev,
    [name]: value
  }));
};


// const handleUpdate = async () => {
//   if (!selectedCampaignId) return;

//   const formData = new FormData();
//   formData.append("campaign_status", campaign.statusFromApi || "Active");
//   formData.append("campaign_name", campaign.name || "");
//   formData.append("description", campaign.description || "");
//   formData.append("narrative_id", campaign.narrative || "");
//   formData.append("start_date", campaign.startDate || "");
//   formData.append("start_time", campaign.startTime || "");
//   formData.append("end_date", campaign.endDate || "");
//   formData.append("end_time", campaign.endTime || "");
//   formData.append("enterprise_id", campaign.enterpriseId || 1);
//   formData.append("updated_by", 1);

//   formData.append("is_monday", Boolean(campaign.days?.monday));
//   formData.append("is_tuesday", Boolean(campaign.days?.tuesday));
//   formData.append("is_wednesday", Boolean(campaign.days?.wednesday));
//   formData.append("is_thursday", Boolean(campaign.days?.thursday));
//   formData.append("is_friday", Boolean(campaign.days?.friday));
//   formData.append("is_saturday", Boolean(campaign.days?.saturday));
//   formData.append("is_sunday", Boolean(campaign.days?.sunday));
//   formData.append("status", "Active");
//   formData.append("location_id", 1);


//   if (fileInputRef.current && fileInputRef.current.files[0]) {
//     formData.append("file", fileInputRef.current.files[0]);
//   }

//   try {
//     await updateCampaign(selectedCampaignId, formData);
//     toast.success("Campaign updated");
//     await fetchCampaigns();
//     setEditMModelOpen(false);
//     setSelectedCampaignId(null);
//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     toast.error("Failed to update campaign");
//   }
// };




const handleUpdate = async () => {
  if (!selectedCampaignId) return;

  // Map selected days to API boolean fields
  const days = {
    is_monday: selectedDays.includes("Monday"),
    is_tuesday: selectedDays.includes("Tuesday"),
    is_wednesday: selectedDays.includes("Wednesday"),
    is_thursday: selectedDays.includes("Thursday"),
    is_friday: selectedDays.includes("Friday"),
    is_saturday: selectedDays.includes("Saturday"),
    is_sunday: selectedDays.includes("Sunday"),
  };

  // Prepare JSON payload
const payload = {
  campaign_name: campaign.name || "",
  description: campaign.description || "",
  narrative_id: campaign.narrative ? Number(campaign.narrative) : 1,
  start_date: campaign.startDate || "",
  end_date: campaign.endDate || "",
  start_time: campaign.startTime ? `${campaign.startTime}:00` : "", // HH:MM:SS
  end_time: campaign.endTime ? `${campaign.endTime}:00` : "",       // HH:MM:SS
  enterprise_id: campaign.enterpriseId ? Number(campaign.enterpriseId) : 1,
  location_id: campaign.location ? 1 : 1,
  status: campaign.status || "Active",
  updated_by: 1,
  campaign_file: campaign.campaignFile || "", // existing file or string
  is_monday: selectedDays.includes("Monday"),
  is_tuesday: selectedDays.includes("Tuesday"),
  is_wednesday: selectedDays.includes("Wednesday"),
  is_thursday: selectedDays.includes("Thursday"),
  is_friday: selectedDays.includes("Friday"),
  is_saturday: selectedDays.includes("Saturday"),
  is_sunday: selectedDays.includes("Sunday"),
};


  try {
    await updateCampaign(selectedCampaignId, payload);
    toast.success("Campaign updated successfully");
    await fetchCampaigns();
    setEditMModelOpen(false); // fix typo
    setSelectedCampaignId(null);
  } catch (error) {
    console.error(error.response?.data || error.message);
    toast.error("Failed to update campaign");
  }
  finally{
    setEditMModelOpen(false);
  }
};

const handleToggleStatus = async (item) => {
  const isDisabled = String(item.statusFromApi || "").toLowerCase() === "disabled";
  const nextStatus = isDisabled ? "Active" : "disabled";
  setActionLoading((prev) => ({ ...prev, [item.id]: "toggle" }));

  const formData = new FormData();
  formData.append("campaign_status", nextStatus);
  formData.append("campaign_name", item.name || "");
  formData.append("description", item.description || "");
  formData.append("narrative_id", item.narrative || "");
  formData.append("start_date", item.startDate || "");
  formData.append("start_time", item.startTime || "");
  formData.append("end_date", item.endDate || "");
  formData.append("end_time", item.endTime || "");
  formData.append("enterprise_id", item.enterpriseId || 1);
  formData.append("updated_by", 1);
  formData.append("is_monday", Boolean(item.days?.monday));
  formData.append("is_tuesday", Boolean(item.days?.tuesday));
  formData.append("is_wednesday", Boolean(item.days?.wednesday));
  formData.append("is_thursday", Boolean(item.days?.thursday));
  formData.append("is_friday", Boolean(item.days?.friday));
  formData.append("is_saturday", Boolean(item.days?.saturday));
  formData.append("is_sunday", Boolean(item.days?.sunday));

  if (item.campaignFile instanceof File) {
    formData.append("file", item.campaignFile);
  }

  try {
    await updateCampaign(item.id, formData);
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === item.id
          ? { ...campaign, statusFromApi: nextStatus === "Active" ? "Active" : "Disabled" }
          : campaign
      )
    );
    toast.success(`Campaign ${nextStatus}`);
  } catch (error) {
    console.error(error.response?.data || error.message);
    toast.error("Failed to update campaign status");
  } finally {
    setActionLoading((prev) => ({ ...prev, [item.id]: null }));
  }
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
<h1>Campaign Management</h1>
<button className="action-button upload-button" onClick={handleOpenCreateModal}>Create Campigin</button>
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

  // const status =
  //   startDT && now < startDT
  //     ? "Upcoming"
  //     : endDT && now > endDT
  //     ? "Completed"
  //     : "Active";

  return (
    <tr key={item.id} className={`campaign-row ${String(item.statusFromApi || "").toLowerCase() === "disabled" ? "row-disabled" : ""}`} >
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
            item.statusFromApi === "Upcoming"
              ? "status-pending"
              : item.statusFromApi === "Completed"
              ? "status-done"
              : "status-active"
          }`}
        >
          {item.statusFromApi}
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
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={String(item.statusFromApi || "").toLowerCase() !== "disabled"}
              onChange={() => handleToggleStatus(item)}
              disabled={actionLoading[item.id] === "toggle"}
            />
            <span className="toggle-slider" />
          </label>
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
        {/* Campaign Details Section */}
        <div className="form-section full-width">
          <h3 className="section-title">Campaign Details</h3>
        </div>
        
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
          <label>Location</label>
          <select
            name="location"
            value={campaign.location}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            {locationOptions.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
  
        <div className="form-group full-width">
          <label>Campaign Description</label>
          <textarea
            name="description"
            placeholder="Enter campaign description"
            value={campaign.description}
            onChange={handleChange}
            rows="2"
          />
        </div>

        {/* <div className="form-group full-width">
          <label>Campaign Narrative</label>
          <textarea
            name="narrative"
            placeholder="Enter campaign narrative"
            value={campaign.narrative}
            onChange={handleChange}
            rows="2"
          />
        </div> */}



    <div className="form-group">
          <label>Campaign Narrative</label>
          <select
            name="narrative"
            value={campaign.narrative}
            onChange={handleChange}
          >
            <option value="">Select narrative</option>
            {narativeOptions.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>







        {/* Schedule Section */}
        <div className="form-section full-width">
          <h3 className="section-title">Schedule</h3>
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

        {/* Active Days Section */}
        <div className="form-group full-width">
          <label>Active Days</label>
          <div className="days-selector">
            <button
              type="button"
              className={`day-pill select-all ${selectedDays.length === days.length ? 'active' : ''}`}
              onClick={handleSelectAll}
            >
              {selectedDays.length === days.length ? 'Deselect All' : 'Select All'}
            </button>
            {days.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-pill ${selectedDays.includes(day) ? 'active' : ''}`}
                onClick={() => handleDayChange(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Slot Configuration Section */}
        <div className="form-section full-width">
          <h3 className="section-title">Slot Configuration</h3>
        </div>

        <div className="slot-config-grid full-width">
          <div className="form-group">
            <label>Slot Start Time</label>
            <input
              type="time"
              name="slotStartTime"
              value={campaign.slotStartTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Slot End Time</label>
            <input
              type="time"
              name="slotEndTime"
              value={campaign.slotEndTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="slotCapacity"
              value={campaign.slotCapacity}
              onChange={handleChange}
              min="1"
              placeholder="Max attendees"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="form-section full-width">
          <h3 className="section-title">Customer Data</h3>
        </div>

        <div className="form-group full-width">
          <div className="upload-area" onClick={handleButtonClick}>
            <Upload size={24} />
            <div className="upload-text">
              <span className="upload-title">Upload Customer Details</span>
              <span className="upload-hint">{selectedFile ? selectedFile.name : 'Click to upload CSV or Excel file'}</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
            />
          </div>
        </div>

      </div>

      <div className="modal-footer">
        <button className="btn cancel" onClick={() => setModelOpen(false)}>
          Cancel
        </button>
        <button className="btn primary" onClick={handleCreate}>
         {loader ?  <div>Loading..</div>:<div>Create</div>  }
        </button>
      </div>

    </div>
  </div>
)}
{editModelOpen && (
  <div className="modal-overlay" onClick={() => setEditMModelOpen(false)}>
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
    <div className="form-group">
          <label>Location</label>
          <select
            name="location"
            value={campaign.location}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            {locationOptions.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Campaign Description</label>
          <textarea
            name="description"
            value={campaign.description}
            onChange={handleChange}
          />
        </div>

        {/* <div className="form-group">
          <label>Campaign Narrative</label>
          <textarea
            name="narrative"
            value={campaign.narrative}
            onChange={handleChange}
          />
        </div> */}


    <div className="form-group">
          <label>Campaign Narrative</label>
          <select
            name="narrative"
            value={campaign.narrative}
            onChange={handleChange}
          >
            <option value="">Select narrative</option>
            {narativeOptions.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
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




          <div className="form-group full-width">
          <label>Active Days</label>
          <div className="days-selector">
            <button
              type="button"
              className={`day-pill select-all ${selectedDays.length === days.length ? 'active' : ''}`}
              onClick={handleSelectAll}
            >
              {selectedDays.length === days.length ? 'Deselect All' : 'Select All'}
            </button>
            {days.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-pill ${selectedDays.includes(day) ? 'active' : ''}`}
                onClick={() => handleDayChange(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        
  <div className="form-group">
             <div className="slot-config-grid full-width">
          <div className="form-group">
            <label>Slot Start Time</label>
            <input
              type="time"
              name="slotStartTime"
              value={campaign.slotStartTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Slot End Time</label>
            <input
              type="time"
              name="slotEndTime"
              value={campaign.slotEndTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="slotCapacity"
              value={campaign.slotCapacity}
              onChange={handleChange}
              min="1"
              placeholder="Max attendees"
            />
          </div>
        </div>
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
