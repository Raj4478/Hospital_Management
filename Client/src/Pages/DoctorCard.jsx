import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorCard = ({
  _id,
  fullName,
  email,
  specialization,
  Contact_Number,
  gender,
  age,
  experience,
  coverImage,
  onManagePatients, // ✅ Ensure this function is properly passed
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Set Initial Form Values ONLY ONCE (Avoid React re-render loops)
  const [form, setForm] = useState({
    fullName,
    email,
    specialization,
    Contact_Number,
    gender,
    age,
    experience,
  });

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = "Full name is required.";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email required.";
    if (!form.specialization) newErrors.specialization = "Specialization is required.";
    if (!form.Contact_Number || !/^\d{10}$/.test(form.Contact_Number))
      newErrors.contactInformation = "Contact must be 10 digits.";
    if (!form.gender) newErrors.gender = "Gender is required.";
    if (!form.age || isNaN(form.age) || form.age <= 0) newErrors.age = "Valid age required.";
    if (!form.experience || isNaN(form.experience) || Number(form.experience) < 0)
      newErrors.experience = "Experience must be a non-negative number.";
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await axios.put(`/api/v1/user/editDoctor/${_id}`, form);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update doctor:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 w-full max-w-md text-center"
    >

      {console.log("Rendering DoctorCard:", form.fullName, specialization)}

      <div className="mb-4">
        <img
          src={coverImage || "/default-doctor.png"}
          alt="Doctor"
          className="w-32 h-32 rounded-full mx-auto object-cover shadow"
        />
      </div>

      <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
        {form.fullName}
      </h2>
      <p className="text-blue-800 font-semibold text-sm tracking-widest mb-3">
        {form.specialization}
      </p>

      <p className="text-gray-600 text-sm mb-6">{form.experience} years of experience</p>

      <div className="bg-blue-800 text-white rounded-lg p-4 space-y-2 text-sm mb-6">
        <p>📧 {form.email}</p>
        <p>📞 {form.Contact_Number}</p>
      </div>

      <div className="flex justify-between gap-4">
        {/* ✅ Ensure clicking this DOES NOT fetch new data repeatedly */}
        <button
          onClick={onManagePatients} // ✅ Fix: Ensure function is properly bound & executed
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg w-1/2"
        >
          Manage Patients
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg w-1/2"
        >
          Edit Details
        </button>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-xl font-bold mb-4 text-blue-900">Edit Doctor Details</h2>

              {["fullName", "email", "specialization", "Contact_Number", "age", "experience"].map((name) => (
                <div key={name} className="mb-3 text-left">
                  <label className="block text-sm font-medium text-gray-700">{name.replace("_", " ")}</label>
                  <input
                    type="text"
                    name={name}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
                  />
                </div>
              ))}

              {/* Gender Dropdown */}
              <div className="mb-3 text-left">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DoctorCard;
