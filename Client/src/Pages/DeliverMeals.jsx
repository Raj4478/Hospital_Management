import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

const DeliverMeals = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ patient: "", staff: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const [dRes, pRes, sRes] = await Promise.all([
        axios.get("/api/v1/user/delivery"),
        axios.get("/api/v1/user/patientdata"),
        axios.get("/api/v1/user/pantrydetail"),
      ]);
      setDeliveries(dRes.data?.data || dRes.data?.message || []);
      setPatients(pRes.data?.data || pRes.data?.message || []);
      setStaff(sRes.data?.data || sRes.data?.message || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async () => {
    if (!form.patient || !form.staff) { toast.error("Select both patient and staff"); return; }
    setSubmitting(true);
    try {
      await axios.post("/api/v1/user/assigndelivery", form);
      toast.success("Delivery assigned!");
      setForm({ patient: "", staff: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign");
    }
    setSubmitting(false);
  };

  const handleDone = async (id) => {
    try {
      await axios.post("/api/v1/user/deleteObject", { id });
      toast.success("Delivery marked as done!");
      fetchAll();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Sidebar role="Manager" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="page-header">
          <h1>Meal Delivery</h1>
          <p>Assign and track patient meal deliveries</p>
        </div>

        {/* Assign form */}
        <div className="card mb-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Assign Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Patient</label>
              <select value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} className="form-input">
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.patientName} — Room {p.roomNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Pantry Staff</label>
              <select value={form.staff} onChange={e => setForm(f => ({ ...f, staff: e.target.value }))} className="form-input">
                <option value="">Select staff</option>
                {staff.map(s => (
                  <option key={s._id} value={s._id}>{s.name} — {s.deliveryStatus}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleAssign} disabled={submitting} className="btn-primary w-full">
                {submitting ? "Assigning..." : "Assign Delivery"}
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries table */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Active Deliveries <span className="badge badge-blue ml-2">{deliveries.length}</span>
          </h2>
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No active deliveries.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Room</th>
                    <th>Assigned Staff</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map(d => (
                    <tr key={d._id}>
                      <td className="font-medium capitalize">{d.patient?.patientName || "—"}</td>
                      <td>Room {d.patient?.roomNumber || "—"}</td>
                      <td className="capitalize">{d.staff?.name || "—"}</td>
                      <td>
                        <button onClick={() => handleDone(d._id)}
                          className="badge badge-green cursor-pointer hover:bg-green-200 transition-colors">
                          ✓ Mark Done
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeliverMeals;
