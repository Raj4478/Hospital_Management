import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorCard from "./DoctorCard";
import PatientCard from "./PatientCard"; // ✅ Import PatientCard
import { motion } from "framer-motion";

const DoctorPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]); // ✅ Store all patients
  const [filteredPatients, setFilteredPatients] = useState([]); // ✅ Store filtered patients
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get("/api/v1/user/getAllDoctors");
      setDoctors(res.data?.message || []);
    } catch (err) {
      setError("Failed to fetch doctor data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const res = await axios.get("/api/v1/user/patientdata");
      setPatients(res.data?.message || []);
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  // Filter patients based on selected doctor's specialization
  const filterPatientsByDoctor = (doctor) => {
    setSelectedDoctor(doctor);

    console.log("Filtering patients for:", doctor.specialization);
    console.log("Patient data before filtering:", patients);

    // ✅ Match `doctor.specialization` with `patient.organAffected` (Now a string)
    const matchedPatients = patients.filter(
      (patient) =>
        
        
        typeof patient.organAffected === "string" &&
        patient.organAffected.toLowerCase() === doctor.specialization.toLowerCase()
    );

    console.log("Matched patients:", matchedPatients); // Debugging output
    setFilteredPatients(matchedPatients);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      {/* Return & Add Doctor Buttons */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          ← Return
        </button>
        <button
          onClick={() => navigate("/createDoctor")}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add Doctor
        </button>
      </div>

      <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-blue-900 mb-10"
      >
        Doctor Directory
      </motion.h1>

      {loading ? (
        <p className="text-center text-blue-600 text-lg">Loading doctors...</p>
      ) : error ? (
        <p className="text-center text-red-600 text-lg">{error}</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No doctors found.</p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              fullName={doctor.fullName}
              email={doctor.email}
              specialization={doctor.specialization}
              contactInformation={doctor.contactInformation}
              gender={doctor.gender}
              age={doctor.age}
              experience={doctor.experience}
              coverImage={doctor.coverImage}
              onManagePatients={() => filterPatientsByDoctor(doctor)} // ✅ Manage Patients Button
            />
          ))}
        </motion.div>
      )}

      {/* Manage Patients Section */}
      {selectedDoctor && (
        <>
          <h2 className="text-2xl font-semibold text-center mt-10 text-blue-900">
            Patients Managed by {selectedDoctor.fullName} ({selectedDoctor.specialization})
          </h2>

          {filteredPatients.length === 0 ? (
            <p className="text-center text-gray-600 text-lg mt-4">No matching patients found.</p>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
            >
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient._id}
                  name={patient.patientName}
                  age={patient.age}
                  allergies={patient.allergies}
                  bedNumber={patient.bedNumber}
                  disease={patient.disease}
                  image={patient.coverImage}
                  patientid={patient._id}
                />
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorPage;
