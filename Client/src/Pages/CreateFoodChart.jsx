import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CreateFoodChart = () => {
  const [image1, setImage1] = useState();
  const [image2, setImage2] = useState();
  const [image3, setImage3] = useState();

  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [preview3, setPreview3] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const notifySuccess = () =>
    toast.success("Menu submitted successfully!", {
      position: "top-center",
      autoClose: 4000,
      theme: "dark",
    });

  const notifyError = (msg) =>
    toast.error(msg || "Submission failed.", {
      position: "top-center",
      autoClose: 4000,
      theme: "dark",
    });

  const handleImageUpload = (file, setter, previewSetter) => {
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    const payload = {
      morning: data.morning,
      evening: data.evening,
      nightMeal: data.night,
      morningIngriends: data.morningIngredients,
      eveningIngriends: data.eveningIngredients,
      nightIngriends: data.nightIngredients,
      coverImage1: image1,
      coverImage2: image2,
      coverImage3: image3,
      specialInstructions: data.specialInstructions,
    };

    try {
      await axios.post("api/v1/user/foodchartmenu", payload, {
        headers: { "content-Type": "multipart/form-data" },
      });

      notifySuccess();
      reset();
      setImage1(null); setImage2(null); setImage3(null);
      setPreview1(null); setPreview2(null); setPreview3(null);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-10"
      >
        {/* Return Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded shadow font-semibold self-start"
        >
          ← Return
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">HOSPITAL MANAGEMENT</h2>
            <p className="text-gray-500 mt-1">📅 Fill in Today’s Menu</p>
          </div>

          {[{
            title: "MORNING SCHEDULE",
            name: "morning",
            ing: "morningIngredients",
            image: "Image1",
            setImage: setImage1,
            setPreview: setPreview1,
            preview: preview1
          }, {
            title: "EVENING SCHEDULE",
            name: "evening",
            ing: "eveningIngredients",
            image: "Image2",
            setImage: setImage2,
            setPreview: setPreview2,
            preview: preview2
          }, {
            title: "NIGHT SCHEDULE",
            name: "night",
            ing: "nightIngredients",
            image: "Image3",
            setImage: setImage3,
            setPreview: setPreview3,
            preview: preview3
          }].map((block, index) => (
            <section key={index}>
              <h3 className="text-lg font-bold text-yellow-600 mb-2">{block.title}</h3>

              <label className="block font-medium">Dish Name</label>
              <input
                {...register(block.name, { required: "Dish name is required" })}
                className="w-full border px-3 py-2 rounded"
              />
              {errors[block.name] && <p className="text-sm text-red-500">{errors[block.name].message}</p>}

              <label className="block font-medium mt-3">Ingredients Used</label>
              <input
                {...register(block.ing, { required: "Ingredients are required" })}
                className="w-full border px-3 py-2 rounded"
              />
              {errors[block.ing] && <p className="text-sm text-red-500">{errors[block.ing].message}</p>}

              <label className="block font-medium mt-3">Cover {block.image}</label>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e.target.files[0], block.setImage, block.setPreview)}
                className="w-full"
              />
              {block.preview && (
                <img
                  src={block.preview}
                  alt="Preview"
                  className="w-32 h-32 mt-2 object-cover rounded shadow"
                />
              )}
            </section>
          ))}

          <section>
            <label className="block font-medium">Special Instructions</label>
            <input
              {...register("specialInstructions", { required: "Instructions required" })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.specialInstructions && (
              <p className="text-sm text-red-500">{errors.specialInstructions.message}</p>
            )}
          </section>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`text-white py-2 px-6 rounded-lg transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Menu"
              )}
            </button>
          </div>
        </form>
      </motion.div>
      <ToastContainer />
    </>
  );
};

export default CreateFoodChart;
