import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

const CreatePantryPersonal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", contactInfo: "", deliveryStatus: "" });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contactInfo || !form.deliveryStatus) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("pantrypersonal", image);

    try {
      await axios.post("/api/v1/user/pantrypersonal", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Pantry staff added!");
      setTimeout(() => navigate("/pantry"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Sidebar role="Pantry" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 mb-3 block">← Back</button>
          <h1>Add Pantry Staff</h1>
          <p>Register a new pantry or delivery staff member</p>
        </div>

        <div className="card max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Staff member name" className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Information *</label>
              <input name="contactInfo" value={form.contactInfo} onChange={handleChange}
                placeholder="+91 98765 43210" className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Status *</label>
              <select name="deliveryStatus" value={form.deliveryStatus} onChange={handleChange} className="form-input">
                <option value="">Select status</option>
                <option value="available">Available</option>
                <option value="on delivery">On Delivery</option>
                <option value="off duty">Off Duty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Photo <span className="text-slate-400">(optional)</span></label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="form-input text-sm" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Adding..." : "Add Staff Member"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePantryPersonal;
