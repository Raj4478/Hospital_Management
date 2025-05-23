import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import emailverification from "./testmail";

const SignUp = () => {
  const [image, setImage] = useState(null);
  const [verifyPopup, setVerifyPopup] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({ defaultValues: { AccountType: ["Doctor"] } });

  const showToast = (message) =>
    toast(message, {
      position: "top-center",
      autoClose: 5000,
      theme: "dark",
    });

  const showError = (message) =>
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      theme: "dark",
    });

  const onSubmit = async (data) => {
    if (!isVerified) {
      showError("Please verify your email before creating an account.");
      return;
    }

    const formdata = new FormData();
    formdata.append("username", data.Username);
    formdata.append("fullName", data.Name);
    formdata.append("password", data.Password);
    formdata.append("email", data.Email);
    formdata.append("coverImage", image);
    formdata.append("AccountType", data.exampleRequired);

    try {
      const res = await axios.post("/api/v1/user/register", formdata);
      showToast("🦄 You have Successfully Signed Up");
      setTimeout(() => navigate("/login"), 6000);
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed. Please try again.";
      console.log(error.response);
      
      showError(message);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-2 h-screen bg-white max-[900px]:grid-cols-1"
      >
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gray-100 flex justify-center"
        >
          <img
            src="/hospital-doctor.png"
            alt="Doctor"
            className="object-cover"
          />
        </motion.div>

        {/* Form Side */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white px-10 py-8 flex flex-col justify-center items-center shadow-md"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="w-full max-w-md">
            <h3 className="text-4xl font-bold text-center text-red-600">
              Hospital <span className="text-yellow-500">Management</span>
            </h3>
            <h5 className="mt-2 text-lg text-center text-gray-800 font-semibold">
              Create an Account.
            </h5>
            <p className="mt-1 text-center text-gray-600 text-sm">
              Create an Account to access the Hospital Services and more.
            </p>

            {/* Username */}
            <div className="mt-6">
              <label className="text-gray-700 font-medium">Username</label>
              <input
                {...register("Username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  maxLength: { value: 30, message: "Maximum 30 characters" },
                })}
                className="w-full border pl-3 py-2 bg-white border-gray-300 rounded-md shadow-sm"
              />
              {errors.Username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.Username.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="mt-4">
              <label className="text-gray-700 font-medium">Full Name</label>
              <input
                {...register("Name", {
                  required: "Full name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  maxLength: { value: 30, message: "Maximum 30 characters" },
                })}
                className="w-full border pl-3 py-2 bg-white border-gray-300 rounded-md shadow-sm"
              />
              {errors.Name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.Name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mt-4">
              <label className="text-gray-700 font-medium">Email</label>
              <div className="flex gap-2">
                <input
                  {...register("Email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  disabled={isVerified}
                  className="w-full border pl-3 py-2 bg-white border-gray-300 rounded-md shadow-sm"
                />
                {!isVerified ? (
                  <button
                    type="button"
                    className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => {
                      const email = getValues("Email");
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        showError("Enter a valid email first");
                        return;
                      }
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedCode(code);
                      emailverification(email, code);
                      setEnteredEmail(email);
                      setVerifyPopup(true);
                    }}
                  >
                    Verify
                  </button>
                ) : (
                  <span className="text-green-600 font-medium self-center">
                    Verified ✓
                  </span>
                )}
              </div>
              {errors.Email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.Email.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="mt-4">
              <label className="text-gray-700 font-medium">Account Type</label>
              <select
                {...register("exampleRequired", {
                  required: "Account type is required",
                })}
                className="w-full border pl-3 py-2 bg-white border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select Account Type</option>
                <option value="Doctor">Doctor</option>
                <option value="Manager">Manager</option>
                <option value="Pantry">Pantry</option>
              </select>
              {errors.exampleRequired && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.exampleRequired.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mt-4">
              <label className="text-gray-700 font-medium">Password</label>
              <input
                type="password"
                {...register("Password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                  maxLength: { value: 20, message: "Maximum 20 characters" },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/,
                    message: "Must include uppercase, number, and special char",
                  },
                })}
                className="w-full border pl-3 py-2 bg-white border-gray-300 rounded-md shadow-sm"
              />
              {errors.Password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.Password.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mt-4">
              <label className="text-gray-700 font-medium">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file?.type.startsWith("image/")) {
                    showError("Only image files are allowed");
                    return;
                  }
                  setImage(file);
                }}
                className="mt-2 text-sm text-gray-600"
              />
            </div>

            {/* Redirect */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </p>

            {/* Submit */}
            <input
              type="submit"
              value="Create Account"
              className="mt-6 w-full text-lg font-semibold text-white bg-red-600 py-2 rounded-md hover:bg-red-700 transition duration-300"
            />
          </div>
        </motion.form>
      </motion.div>

      {/* Email Verification Popup */}
      {verifyPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Verify Your Email</h3>
            <p className="text-sm text-gray-700 mb-2">
              Code sent to:{" "}
              <span className="font-medium">{enteredEmail}</span>
            </p>
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Enter verification code"
            />
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={() => {
                  setVerifyPopup(false);
                  setEmailCode("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                onClick={() => {
                  if (emailCode === generatedCode) {
                    setIsVerified(true);
                    setVerifyPopup(false);
                    toast.success("Email verified!", {
                      position: "top-center",
                      theme: "dark",
                    });
                  } else {
                    showError("Incorrect verification code");
                  }
                }}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default SignUp;
