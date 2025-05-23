import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

const CreatePantryStaff = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const notifySuccess = () =>
    toast.success("✅ Staff created successfully!", {
      position: "top-center",
      theme: "dark",
    });

  const notifyError = (msg) =>
    toast.error(msg || "Something went wrong", {
      position: "top-center",
      theme: "dark",
    });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const jsons = {
      name: data.name,
      deliveryStatus: "available", // Hardcoded
      contactInfo: data.contactinfo,
      pantrypersonal: image,
    };

    try {
      const url = "api/v1/user/pantry";
      const formdata = new FormData();
      formdata.append("coverImage", image);

      axios({
        method: "post",
        url: url,
        data: jsons,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((res) => {
          notifySuccess();
          reset();
          setImage(null);
          setPreview(null);
        })
        .catch((err) => notifyError(err.message));
    } catch (err) {
      notifyError(err.message);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-pink-50 flex flex-col items-center justify-center px-6 py-12"
      >
        {/* Return Button */}
        <div className="w-full max-w-xl mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-blue-600 font-semibold"
          >
            ← Return
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-xl bg-white p-8 shadow-xl rounded-3xl"
        >
          <h3 className="text-3xl font-bold text-center text-red-500 font-great">
            Hospital <span className="text-amber-400">Management</span>
          </h3>
          <p className="text-center text-red-300 mt-2">
            Please Enter the Staff Details Here
          </p>

          {/* Name */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-sky-500 mb-1">
              Name
            </label>
            <input
              {...register("name", {
                required: "Name is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
              })}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-sky-500 mb-1">
              Contact Info
            </label>
            <input
              {...register("contactinfo", {
                required: "Contact info is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
              })}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            {errors.contactinfo && (
              <p className="text-sm text-red-500 mt-1">
                {errors.contactinfo.message}
              </p>
            )}
          </div>

          {/* Delivery Status (readonly) */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-sky-500 mb-1">
              Delivery Status
            </label>
            <input
              value="available"
              readOnly
              disabled
              className="w-full border border-gray-200 px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* Image Upload */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-sky-500 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block text-sm"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 h-32 w-32 object-cover rounded-full border"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 text-lg font-bold rounded ${
                loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-red-300 hover:bg-red-400 text-white transition"
              }`}
            >
              {loading ? "Submitting..." : "Submit Data"}
            </button>
          </div>
        </form>
      </motion.div>

      <ToastContainer />
    </>
  );
};

export default CreatePantryStaff;
