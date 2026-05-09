import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/user/login", {
        email: data.email,
        password: data.password,
        AccountType: data.AccountType,
      });
      const userId = res.data.data?.user?._id || res.data.message?.user?._id;
      toast.success("Login successful!");
      setTimeout(() => {
        if (data.AccountType === "Manager") navigate("/manager", { state: { userId } });
        else navigate("/pantry", { state: { userId } });
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-sky-600 to-blue-700 p-10 text-white">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏥</div>
              <span className="text-xl font-bold">MediCare HMS</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Streamline your hospital operations
            </h2>
            <p className="text-sky-100 text-sm leading-relaxed">
              Manage patients, doctors, diet plans, and delivery staff all from one powerful dashboard.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: "👥", text: "Patient record management" },
              { icon: "👨‍⚕️", text: "Doctor & staff coordination" },
              { icon: "🍽️", text: "Diet & meal tracking" },
              { icon: "🚚", text: "Delivery assignment system" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-sky-100">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-sky-700">MediCare HMS</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h3>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                type="email"
                placeholder="doctor@hospital.com"
                className="form-input"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                type="password"
                placeholder="••••••••"
                className="form-input"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                {...register("AccountType", { required: "Please select a role" })}
                defaultValue=""
                className="form-input"
              >
                <option value="" disabled>Select your role</option>
                <option value="Manager">Manager</option>
                <option value="Pantry">Pantry Staff</option>
                <option value="Doctor">Doctor</option>
              </select>
              {errors.AccountType && <p className="text-red-500 text-xs mt-1">{errors.AccountType.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Need an account?{" "}
            <a href="/signup" className="text-sky-600 font-semibold hover:underline">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
