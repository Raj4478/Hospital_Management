import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const PatientFetch = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/v1/user/patientdata")
      .then(res => setPatients(res.data?.data || res.data?.message || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.disease?.toLowerCase().includes(search.toLowerCase()) ||
    p.roomNumber?.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="Manager" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="page-header flex justify-between items-start">
          <div>
            <h1>Patients</h1>
            <p>{patients.length} total patients registered</p>
          </div>
          <button onClick={() => navigate("/createpatient")} className="btn-primary">+ Add Patient</button>
        </div>

        <div className="card">
          <div className="mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, disease or room..."
              className="form-input max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading patients...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No patients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Disease</th>
                    <th>Blood Group</th>
                    <th>Room</th>
                    <th>Floor</th>
                    <th>Gender</th>
                    <th>Organ Affected</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {p.coverImage ? (
                            <img src={p.coverImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                              {p.patientName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium capitalize">{p.patientName}</div>
                            <div className="text-xs text-slate-400">Age: {p.age || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-red">{p.disease}</span></td>
                      <td><span className="badge badge-blue uppercase">{p.bloodGroup}</span></td>
                      <td>Room {p.roomNumber} / Bed {p.bedNumber}</td>
                      <td>{p.floorNumber || "—"}</td>
                      <td className="capitalize">{p.gender || "—"}</td>
                      <td className="capitalize">{p.organAffected || "—"}</td>
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

export default PatientFetch;
