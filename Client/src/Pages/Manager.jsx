import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div className="stat-card cursor-pointer" onClick={onClick}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </div>
);

const Manager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [stats, setStats] = useState({ patients: 0, doctors: 0, menus: 0, deliveries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, dRes, mRes, delRes] = await Promise.allSettled([
          axios.get("/api/v1/user/patientdata"),
          axios.get("/api/v1/user/getalldoctors"),
          axios.get("/api/v1/user/menu"),
          axios.get("/api/v1/user/delivery"),
        ]);
        setStats({
          patients: pRes.status === "fulfilled" ? (pRes.value.data?.data || pRes.value.data?.message || []).length : 0,
          doctors: dRes.status === "fulfilled" ? (dRes.value.data?.data || dRes.value.data?.message || []).length : 0,
          menus: mRes.status === "fulfilled" ? (mRes.value.data?.data || mRes.value.data?.message || []).length : 0,
          deliveries: delRes.status === "fulfilled" ? (delRes.value.data?.data || delRes.value.data?.message || []).length : 0,
        });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: "👥", label: "Total Patients", value: loading ? "—" : stats.patients, color: "bg-blue-100", path: "/allpatient" },
    { icon: "👨‍⚕️", label: "Doctors", value: loading ? "—" : stats.doctors, color: "bg-emerald-100", path: "/alldoctors" },
    { icon: "🍽️", label: "Diet Plans", value: loading ? "—" : stats.menus, color: "bg-amber-100", path: "/menu" },
    { icon: "🚚", label: "Deliveries", value: loading ? "—" : stats.deliveries, color: "bg-purple-100", path: "/deliverMeals" },
  ];

  const quickActions = [
    { icon: "➕", label: "Add Patient", path: "/createpatient", color: "border-blue-200 hover:bg-blue-50" },
    { icon: "🩺", label: "Add Doctor", path: "/createdoctor", color: "border-emerald-200 hover:bg-emerald-50" },
    { icon: "📋", label: "Add Diet Plan", path: "/createfoodchart", color: "border-amber-200 hover:bg-amber-50" },
    { icon: "👤", label: "Add Pantry Staff", path: "/createpantry", color: "border-purple-200 hover:bg-purple-50" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="Manager" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="page-header">
          <h1>Manager Dashboard</h1>
          <p>Hospital overview and quick actions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map(card => (
            <StatCard key={card.label} {...card} onClick={() => navigate(card.path)} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${action.color}`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-3">System Info</h2>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            All systems operational
          </div>
        </div>
      </main>
    </div>
  );
};

export default Manager;
