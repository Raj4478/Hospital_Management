import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("AccountType", data.AccountType);
    if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);

    try {
      await axios.post("/api/v1/user/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Account created! Please log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-sky-700">MediCare HMS</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">Create account</h3>
        <p className="text-slate-500 text-sm mb-8">Register as a hospital staff member</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "fullName", label: "Full Name", placeholder: "Dr. John Smith", type: "text" },
            { name: "email", label: "Email", placeholder: "john@hospital.com", type: "email" },
            { name: "username", label: "Username", placeholder: "johnsmith", type: "text" },
            { name: "password", label: "Password", placeholder: "••••••••", type: "password" },
          ].map(({ name, label, placeholder, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input {...register(name, { required: `${label} is required` })}
                type={type} placeholder={placeholder} className="form-input" />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select {...register("AccountType", { required: "Select a role" })} defaultValue="" className="form-input">
              <option value="" disabled>Select role</option>
              <option value="Manager">Manager</option>
              <option value="Pantry">Pantry Staff</option>
              <option value="Doctor">Doctor</option>
            </select>
            {errors.AccountType && <p className="text-red-500 text-xs mt-1">{errors.AccountType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Photo <span className="text-slate-400">(optional)</span></label>
            <input {...register("coverImage")} type="file" accept="image/*" className="form-input text-sm" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
