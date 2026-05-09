import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

const CreateNewPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientName: "", disease: "", allergies: "", bloodGroup: "",
    roomNumber: "", bedNumber: "", floorNumber: "", age: "",
    gender: "", contactInformation: "", emergencyContact: "", organAffected: ""
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.disease || !form.bloodGroup || !form.roomNumber || !form.bedNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("patientimage", image);

    try {
      await axios.post("/api/v1/user/patientdetail", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Patient registered successfully!");
      setTimeout(() => navigate("/allpatient"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "patientName", label: "Patient Name *", placeholder: "Full name", type: "text" },
    { name: "disease", label: "Disease *", placeholder: "Primary diagnosis", type: "text" },
    { name: "bloodGroup", label: "Blood Group *", placeholder: "e.g. A+", type: "text" },
    { name: "roomNumber", label: "Room Number *", placeholder: "e.g. 101", type: "text" },
    { name: "bedNumber", label: "Bed Number *", placeholder: "e.g. B2", type: "text" },
    { name: "floorNumber", label: "Floor Number", placeholder: "e.g. 2", type: "text" },
    { name: "age", label: "Age", placeholder: "Patient age", type: "text" },
    { name: "allergies", label: "Allergies", placeholder: "Known allergies", type: "text" },
    { name: "organAffected", label: "Organ Affected", placeholder: "e.g. Liver", type: "text" },
    { name: "contactInformation", label: "Contact Number", placeholder: "Patient contact", type: "text" },
    { name: "emergencyContact", label: "Emergency Contact", placeholder: "Emergency number", type: "text" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Sidebar role="Manager" />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 mb-3 block">← Back</button>
          <h1>Register Patient</h1>
          <p>Add a new patient to the system</p>
        </div>

        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                  <input
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient Photo <span className="text-slate-400">(optional)</span></label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="form-input text-sm" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Registering..." : "Register Patient"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateNewPatient;
