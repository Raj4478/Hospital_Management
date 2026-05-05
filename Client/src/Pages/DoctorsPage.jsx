import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/v1/user/getalldoctors")
      .then(res => setDoctors(res.data?.data || res.data?.message || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="Manager" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="page-header flex justify-between items-start">
          <div>
            <h1>Doctors</h1>
            <p>{doctors.length} doctors registered</p>
          </div>
          <button onClick={() => navigate("/createdoctor")} className="btn-primary">+ Add Doctor</button>
        </div>

        <div className="card">
          <div className="mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or specialization..."
              className="form-input max-w-sm" />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading doctors...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No doctors found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(doc => (
                <div key={doc._id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    {doc.coverImage ? (
                      <img src={doc.coverImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-600">
                        {doc.fullName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-800">{doc.fullName}</div>
                      <span className="badge badge-green text-xs">{doc.specialization}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-slate-500">
                    {doc.email && <div>📧 {doc.email}</div>}
                    {doc.Contact_Number && <div>📞 {doc.Contact_Number}</div>}
                    {doc.experience && <div>🏅 {doc.experience} years experience</div>}
                    {doc.bio && <div className="text-xs mt-2 line-clamp-2">{doc.bio}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorsPage;
