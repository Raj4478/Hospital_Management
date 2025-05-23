import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateDoctor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    specialization: "",
    Contact_Number: "",
    gender: "",
    age: "",
    experience: "",
    doctorImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    console.log("data is",formData.Contact_Number);
    
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("specialization", formData.specialization);
    data.append("Contact_Number", formData.Contact_Number);
    data.append("gender", formData.gender);
    data.append("age", formData.age);
    data.append("experience", formData.experience);
    if (formData.doctorImage) {
      data.append("doctorImage", formData.doctorImage);
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("api/v1/user/registerDoctor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Doctor registered successfully!");
        setTimeout(() => navigate(-1), 2000);
      } else {
        toast.error(result?.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Error submitting doctor info:", err);
      toast.error("Something went wrong!");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-2">
          UPLOAD DOCTOR INFORMATION
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Please Enter the Details Below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
          
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />

          <div className="flex gap-2">
            <Input label="Contact Number" name="Contact_Number" value={formData.Contact_Number} onChange={handleChange} />
            {console.log(formData.Contact_Number)
          }
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
            <Input label="Experience" name="experience" type="number" value={formData.experience} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            <input
              type="file"
              name="doctorImage"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-32 w-32 object-cover rounded"
              />
            )}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={submitting}
            className={`w-full py-2 rounded text-white font-semibold transition ${
              submitting ? "bg-blue-300" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {submitting ? "Submitting..." : "SUBMIT"}
          </motion.button>
        </form>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← Return
        </button>
      </motion.div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
    />
  </div>
);

export default CreateDoctor;
