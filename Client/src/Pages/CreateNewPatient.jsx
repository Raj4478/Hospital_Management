import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const diseases = ["Diabetes", "Hypertension", "Asthma", "Back Pain", "Arthritis", "Digestive Issues", "Mental Stress"];

const organs = ["Liver", "Heart", "Lungs", "Kidneys", "Brain", "Spine", "Digestive System"];

const NewPatient = () => {
  const [image, setImage] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loggedin = () => toast.success("🦄 Patient profile created successfully!", { position: "top-center", autoClose: 5000, theme: "dark" });

  const error1 = (einput) => toast.error(einput, { position: "top-center", autoClose: 5000, theme: "dark" });

  // Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Form submission handler with proper FormData
  const onSubmit = async (data) => {
    setLoading(true);

    console.log(data);
    
    const formData = new FormData();
    formData.append("patientName", data.patientName);
    formData.append("disease", data.disease);
    formData.append("allergies", data.allergies);
    formData.append("floorNumber", data.floorNumber);
    formData.append("bloodGroup", data.bloodGroup);
    formData.append("gender", data.gender);
    formData.append("roomNumber", data.roomNumber);
    formData.append("bedNumber", data.bedNumber);
    formData.append("age", data.age);
    formData.append("contactInformation", data.contactInformation);
    formData.append("emergencyContact", data.emergencyContact);
    formData.append("organAffected", data.organAffected);
    
    if (image) {
      formData.append("patientimage", image); // ✅ Correctly appending the image
    }

    try {
      await axios.post("api/v1/user/patientDetail", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      loggedin();
      reset();
      setImage(null);
      setPreview(null);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      error1("Failed to create patient profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Return Button */}
      <div className="flex justify-start px-8 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-black font-medium px-4 py-2 rounded-md shadow-md transition"
        >
          ← Return
        </button>
      </div>

      <motion.div initial={{ x: -70 }} animate={{ x: 0 }} transition={{ delay: 0.5, duration: 1 }} className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl bg-white shadow-xl rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Image Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <img src={preview || "/placeholder.png"} alt="Patient Preview" className="w-40 h-40 rounded-full object-cover border border-gray-300" />
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
          </div>

          {/* Patient Form Section */}
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-2xl font-bold text-blue-800 text-center mb-2 col-span-2">Patient Profile</h3>

            <input placeholder="Patient Name:" {...register("patientName", { required: true })} className="border p-2 rounded-md" disabled={loading} />

            {/* Disease Dropdown */}
            <select {...register("disease", { required: true })} className="border p-2 rounded-md" disabled={loading}>
              <option value="">-- Select Disease --</option>
              {diseases.map((disease) => <option key={disease} value={disease}>{disease}</option>)}
            </select>

            {/* Organ Affected Dropdown */}
            <select {...register("organAffected", { required: true })} className="border p-2 rounded-md" disabled={loading}>
              <option value="">-- Select Affected Organ --</option>
              {organs.map((organ) => <option key={organ} value={organ}>{organ}</option>)}
            </select>

            <input placeholder="Age:" {...register("age", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <input placeholder="Allergies:" {...register("allergies", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <select {...register("gender", { required: true })} className="border p-2 rounded-md" disabled={loading}>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Prefer not to say</option>
            </select>
            <input placeholder="Floor Number:" {...register("floorNumber", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <input placeholder="Room Number:" {...register("roomNumber", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <input placeholder="Blood Group:" {...register("bloodGroup", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <input placeholder="Bed Number:" {...register("bedNumber", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <input placeholder="Contact Information:" {...register("contactInformation", { required: true })} className="border p-2 rounded-md" disabled={loading} />
            <input placeholder="Emergency Contact:" {...register("emergencyContact", { required: true })} className="border p-2 rounded-md" disabled={loading} />

            <button type="submit" disabled={loading} className={`mt-4 flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}>
              {loading ? "Submitting..." : "Create Profile"}
            </button>
          </div>
        </form>
      </motion.div>
      <ToastContainer />
    </>
  );
};

export default NewPatient;
