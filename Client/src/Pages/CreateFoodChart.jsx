import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

const CreateFoodChart = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    morning: "", evening: "", nightMeal: "",
    morningIngredients: "", eveningIngredients: "", nightIngredients: "",
    specialInstructions: ""
  });
  const [images, setImages] = useState({ coverImage1: null, coverImage2: null, coverImage3: null });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.morning || !form.evening || !form.nightMeal) {
      toast.error("Morning, evening, and night meal are required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (images.coverImage1) formData.append("coverImage1", images.coverImage1);
    if (images.coverImage2) formData.append("coverImage2", images.coverImage2);
    if (images.coverImage3) formData.append("coverImage3", images.coverImage3);

    try {
      await axios.post("/api/v1/user/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Diet plan created!");
      setTimeout(() => navigate("/menu"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create diet plan");
    } finally {
      setLoading(false);
    }
  };

  const meals = [
    { key: "morning", label: "🌅 Morning Meal *", imgKey: "coverImage1", ingKey: "morningIngredients" },
    { key: "evening", label: "🌤️ Evening Meal *", imgKey: "coverImage2", ingKey: "eveningIngredients" },
    { key: "nightMeal", label: "🌙 Night Meal *", imgKey: "coverImage3", ingKey: "nightIngredients" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Sidebar role="Manager" />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 mb-3 block">← Back</button>
          <h1>Create Diet Plan</h1>
          <p>Set up a meal plan for patients</p>
        </div>

        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {meals.map(meal => (
              <div key={meal.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-3">{meal.label}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Meal Name</label>
                    <input name={meal.key} value={form[meal.key]} onChange={handleChange}
                      placeholder="e.g. Oatmeal with fruits" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Ingredients</label>
                    <input name={meal.ingKey} value={form[meal.ingKey]} onChange={handleChange}
                      placeholder="List ingredients..." className="form-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Meal Photo <span className="text-slate-400">(optional)</span></label>
                    <input type="file" accept="image/*"
                      onChange={e => setImages(i => ({ ...i, [meal.imgKey]: e.target.files[0] }))}
                      className="form-input text-sm" />
                  </div>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Special Instructions</label>
              <textarea name="specialInstructions" value={form.specialInstructions} onChange={handleChange}
                placeholder="Any dietary restrictions or special notes..." rows={3}
                className="form-input resize-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating..." : "Create Diet Plan"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateFoodChart;
