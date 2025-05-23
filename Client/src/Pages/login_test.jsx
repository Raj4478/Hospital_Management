import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const notifySuccess = () =>
    toast.success("🦄 Successfully Logged In", {
      position: "top-center",
      autoClose: 5000,
      theme: "dark",
    });

  const notifyError = (msg) =>
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      theme: "dark",
    });

  const onSubmit = async (data) => {
    const jsons = {
      email: data.Email,
      password: data.Password,
      AccountType: data.AccountType,
    };

    setLoading(true);
    try {
      const urls = "/api/v1/user/login";
      const res = await axios.post(urls, jsons);
      notifySuccess();
      if (jsons.AccountType === "Manager") {
        navigate("/manager");
      } else {
        navigate("/pantry");
      }
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      <motion.div
        initial={{ x: -70 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-white"
      >
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center px-8 py-12 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <div className="w-full max-w-md space-y-6">
            <h3 className="text-4xl font-bold text-blue-700">
              Hospital<span className="text-green-500">Login</span>
            </h3>
            <p className="text-gray-600">
              Welcome back! Please log in to continue.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register("Email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format",
                  },
                })}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200"
              />
              {errors.Email && (
                <p className="text-sm text-red-600">{errors.Email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                {...register("Password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Minimum 8 characters required",
                  },
                })}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200"
              />
              {errors.Password && (
                <p className="text-sm text-red-600">
                  {errors.Password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                defaultValue=""
                {...register("AccountType", { required: "Select a role" })}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200"
              >
                <option value="" disabled>
                  Select Account Type
                </option>
                <option value="Manager">Manager</option>
                <option value="Pantry">PantryStaff</option>
                <option value="Doctor">Doctor</option>
              </select>
              {errors.AccountType && (
                <p className="text-sm text-red-600">
                  {errors.AccountType.message}
                </p>
              )}
            </div>

            <div className="text-sm text-center">
              New here?{" "}
              <Link to="/signup" className="text-blue-500 hover:underline">
                Create an account
              </Link>
            </div>

            <input
              type="submit"
              value="Log In"
              className="w-full py-2 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            />
          </div>
        </motion.form>

        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="hidden md:block bg-cover bg-center"
          style={{ backgroundImage: "url('/hospital-doctor.png')" }}
        ></motion.div>
      </motion.div>

      <ToastContainer />
    </>
  );
};

export default Login;
