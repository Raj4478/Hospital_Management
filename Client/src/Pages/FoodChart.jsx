import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FoodMenu = () => {
  const [apiData, setApiData] = useState(null);
  const [editMeal, setEditMeal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("/api/v1/user/menu");
        const data = await response.json();
        setApiData(data.message[0]);
      } catch (error) {
        console.error("API Error:", error);
      }
    };
    fetchMenu();
  }, []);

  const handleEdit = (mealTime) => {
    const dish = mealTime === "Morning" ? apiData.morning
      : mealTime === "Evening" ? apiData.evening
      : apiData.nightMeal;

    const ingredients = mealTime === "Morning"
      ? apiData.morningIngriends
      : apiData.nightIngriends;

    const instructions = apiData.specialInstructions;

    setEditMeal({ mealTime, dish, ingredients, instructions });
  };

  const handleSave = async () => {
    if (!editMeal) return;

    try {
      const response = await fetch(`/api/v1/user/menu/${apiData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          morning: editMeal.mealTime === "Morning" ? editMeal.dish : apiData.morning,
          morningIngriends: editMeal.mealTime === "Morning" ? editMeal.ingredients : apiData.morningIngriends,
          evening: editMeal.mealTime === "Evening" ? editMeal.dish : apiData.evening,
          eveningIngriends: editMeal.mealTime === "Evening" ? editMeal.ingredients : apiData.eveningIngriends,
          nightMeal: editMeal.mealTime === "Night" ? editMeal.dish : apiData.nightMeal,
          nightIngriends: editMeal.mealTime === "Night" ? editMeal.ingredients : apiData.nightIngriends,
          specialInstructions: editMeal.instructions,
        }),
      });

      const updatedData = await response.json();

      if (!updatedData.success) {
        throw new Error("Failed to update meal data");
      }

      console.log("Updated Data:", updatedData.data); // Debugging check
      setApiData(updatedData.data); // ✅ Update UI state correctly
      setEditMeal(null);
    } catch (error) {
      console.error("Error updating meal data:", error);
    }
  };

  return apiData ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="p-6 max-w-6xl mx-auto">
      {/* Return Button */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded shadow font-semibold">
          ← Return
        </button>
      </div>

      <h2 className="text-4xl font-bold text-center text-gray-800 mb-6 font-new">Today's Menu</h2>

      {["Morning", "Evening", "Night"].map((mealTime, idx) => {
        const image = mealTime === "Morning" ? apiData.coverImage1
          : mealTime === "Evening" ? apiData.coverImage2
          : apiData.coverImage3;

        const dish = mealTime === "Morning" ? apiData.morning
          : mealTime === "Evening" ? apiData.evening
          : apiData.nightMeal;

        const ingredients = mealTime === "Morning" ? apiData.morningIngriends
          : apiData.nightIngriends;

        return (
          <motion.div key={mealTime} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.3 }} className="mb-12 border-b pb-8">
            <h3 className="text-center text-3xl font-bold text-gray-900 mb-6">{mealTime.toUpperCase()}</h3>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 px-4">
              <div className="relative">
                <img src={image} alt={`${mealTime} dish`} className="w-80 h-auto rounded-xl shadow-lg object-cover" />
                <button onClick={() => handleEdit(mealTime)} className="absolute top-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow hover:bg-gray-100">✏️</button>
              </div>
              <div className="flex flex-col justify-between flex-grow">
                <div className="space-y-3 text-lg font-medium text-gray-800 font-new">
                  <p><span className="font-bold uppercase">Dish Name:</span> {dish}</p>
                  <p><span className="font-bold uppercase">Ingredients:</span> {ingredients}</p>
                  <p><span className="font-bold uppercase">Special Instructions:</span> {apiData.specialInstructions}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Modal for Editing */}
      <AnimatePresence>
        {editMeal && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4">Edit {editMeal.mealTime} Meal</h3>
              <div className="space-y-4">
                <input className="w-full border px-3 py-2 rounded" value={editMeal.dish} onChange={(e) => setEditMeal({ ...editMeal, dish: e.target.value })} placeholder="Dish Name" />
                <input className="w-full border px-3 py-2 rounded" value={editMeal.ingredients} onChange={(e) => setEditMeal({ ...editMeal, ingredients: e.target.value })} placeholder="Ingredients" />
                <input className="w-full border px-3 py-2 rounded" value={editMeal.instructions} onChange={(e) => setEditMeal({ ...editMeal, instructions: e.target.value })} placeholder="Special Instructions" />
              </div>
              <div className="flex justify-end mt-6 gap-3">
                <button onClick={() => setEditMeal(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  ) : <div className="flex justify-center items-center min-h-screen">Loading...</div>;
};

export default FoodMenu;
