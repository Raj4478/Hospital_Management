import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

const CreateDoctor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", specialization: "",
    Contact_Number: "", website: "", bio: "", age: "", experience: ""
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.specialization || !form.Contact_Number) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("doctorImage", image);

    try {
      await axios.post("/api/v1/user/registerdoctor", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Doctor registered successfully!");
      setTimeout(() => navigate("/alldoctors"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register doctor");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name *", placeholder: "Dr. Jane Smith" },
    { name: "email", label: "Email *", placeholder: "doctor@hospital.com" },
    { name: "specialization", label: "Specialization *", placeholder: "e.g. Cardiology" },
    { name: "Contact_Number", label: "Contact Number *", placeholder: "+91 98765 43210" },
    { name: "website", label: "Website", placeholder: "https://..." },
    { name: "age", label: "Age", placeholder: "Doctor's age" },
    { name: "experience", label: "Years of Experience", placeholder: "e.g. 10" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Sidebar role="Manager" />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 mb-3 block">← Back</button>
          <h1>Register Doctor</h1>
          <p>Add a new doctor to the system</p>
        </div>

        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                  <input name={f.name} type="text" placeholder={f.placeholder}
                    value={form[f.name]} onChange={handleChange} className="form-input" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio <span className="text-slate-400">(optional)</span></label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                placeholder="Brief professional bio..." rows={3}
                className="form-input resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Photo <span className="text-slate-400">(optional)</span></label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="form-input text-sm" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Registering..." : "Register Doctor"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateDoctor;
