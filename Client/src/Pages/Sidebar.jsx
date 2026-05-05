import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const managerLinks = [
  { path: "/manager", label: "Dashboard", icon: "⚡" },
  { path: "/allpatient", label: "Patients", icon: "👥" },
  { path: "/alldoctors", label: "Doctors", icon: "👨‍⚕️" },
  { path: "/menu", label: "Diet Chart", icon: "🍽️" },
  { path: "/deliverMeals", label: "Meal Delivery", icon: "🚚" },
  { path: "/createpatient", label: "Add Patient", icon: "➕" },
  { path: "/createfoodchart", label: "Add Diet", icon: "📋" },
  { path: "/createdoctor", label: "Add Doctor", icon: "🩺" },
];

const pantryLinks = [
  { path: "/pantry", label: "Dashboard", icon: "⚡" },
  { path: "/allpatient", label: "Patients", icon: "👥" },
  { path: "/menu", label: "Diet Chart", icon: "🍽️" },
  { path: "/deliverMeals", label: "Meal Delivery", icon: "🚚" },
  { path: "/createpantry", label: "Add Staff", icon: "➕" },
];

const Sidebar = ({ role = "Manager" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const links = role === "Manager" ? managerLinks : pantryLinks;
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    try { await axios.post("/api/v1/user/logout"); } catch {}
    toast.success("Logged out");
    setTimeout(() => navigate("/login"), 500);
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-white text-xs">🏥</div>
          <span className="font-bold text-slate-800 text-sm">MediCare HMS</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 text-lg">
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 mt-14">
          <span className="badge badge-blue text-xs">{role}</span>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map(link => (
            <div key={link.path} onClick={() => handleNav(link.path)}
              className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}>
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white text-sm">🏥</div>
          <span className="font-bold text-slate-800 text-sm">MediCare HMS</span>
        </div>
        <div className="px-4 py-3">
          <span className="badge badge-blue text-xs">{role}</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <div key={link.path} onClick={() => navigate(link.path)}
              className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}>
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
