import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const Pantry = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, menus: 0, deliveries: 0, staff: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, mRes, delRes, sRes] = await Promise.allSettled([
          axios.get("/api/v1/user/patientdata"),
          axios.get("/api/v1/user/menu"),
          axios.get("/api/v1/user/delivery"),
          axios.get("/api/v1/user/pantrydetail"),
        ]);
        setStats({
          patients: pRes.status === "fulfilled" ? (pRes.value.data?.data || pRes.value.data?.message || []).length : 0,
          menus: mRes.status === "fulfilled" ? (mRes.value.data?.data || mRes.value.data?.message || []).length : 0,
          deliveries: delRes.status === "fulfilled" ? (delRes.value.data?.data || delRes.value.data?.message || []).length : 0,
          staff: sRes.status === "fulfilled" ? (sRes.value.data?.data || sRes.value.data?.message || []).length : 0,
        });
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { icon: "👥", label: "Patients", value: stats.patients, color: "bg-blue-100", path: "/allpatient" },
    { icon: "🍽️", label: "Diet Plans", value: stats.menus, color: "bg-amber-100", path: "/menu" },
    { icon: "🚚", label: "Deliveries", value: stats.deliveries, color: "bg-purple-100", path: "/deliverMeals" },
    { icon: "👤", label: "Pantry Staff", value: stats.staff, color: "bg-emerald-100", path: "/createpantry" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="Pantry" />
      <main className="flex-1 p-4 md:p-8">
        <div className="page-header">
          <h1>Pantry Dashboard</h1>
          <p>Manage meal preparation and delivery</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map(card => (
            <div key={card.label} className="stat-card cursor-pointer" onClick={() => navigate(card.path)}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${card.color}`}>{card.icon}</div>
              <div className="text-2xl font-bold text-slate-800 mb-1">{loading ? "—" : card.value}</div>
              <div className="text-sm text-slate-500">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => navigate("/deliverMeals")} className="btn-primary">Assign Delivery</button>
            <button onClick={() => navigate("/menu")} className="btn-outline">View Diet Chart</button>
            <button onClick={() => navigate("/createpantry")} className="btn-outline">Add Staff</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pantry;
